package com.petmanager.infra.scheduler;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.petmanager.application.AuthService;
import com.petmanager.application.event.*;
import com.petmanager.config.lock.DistributeLock;
import com.petmanager.infra.outbox.AuthOutbox;
import com.petmanager.infra.outbox.AuthOutboxRepo;
import com.petmanager.infra.outbox.OutboxStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class OutBoxEventPublishScheduler {

    private final AuthOutboxRepo authOutboxRepo;
    private final AuthService authService;
    private final ObjectMapper obm;

    /// pending 상태는 1초에 1번씩 시도.
    /// 분산락을 통해 서버가 늘어나도 동시성 문제 발생하지 않도록 레디슨 분산락 사용.
    @Scheduled(fixedDelay = 1000)
    @DistributeLock(key = "outbox-pending-events")
    public void publishPendingEvents() {

        List<AuthOutbox> top1000ByStatusOrderByCreatedAtAsc = authOutboxRepo
                .findTop1000ByStatusOrderByCreatedAtAsc(OutboxStatus.PENDING);

        List<Long> authIds = new ArrayList<>();

        for (AuthOutbox authOutbox : top1000ByStatusOrderByCreatedAtAsc) {
            try {

                DomainEvent event = convertValue(authOutbox.getEventType(), authOutbox.getEventValue());

                // 레디스로 발송
                authService.publishEvent(event);

                authIds.add(authOutbox.getId());

                /// 100개씩 벌크 업데이트
                if (authIds.size() == 100) {
                    // 발송 성공
                    authOutboxRepo.bulkUpdateOutboxStatus(OutboxStatus.PUBLISHED, authIds);
                    // 리스트 초기화
                    authIds.clear();
                }

            } catch (Exception e) {
                // 에러 발생 시 처리
                authOutboxRepo.updateOutboxStatus(OutboxStatus.FAILED, authOutbox.getId());
                log.error("스케줄러 릴레이 역직렬화/발송 실패. outbox Id: {}", authOutbox.getId(), e);
            }
        }

        /// 잔여값 벌크업데이트
        if (!authIds.isEmpty()) {
            authOutboxRepo.bulkUpdateOutboxStatus(OutboxStatus.PUBLISHED, authIds);
            authIds.clear();
        }
    }

    /// failed 상태는 5초에 1번씩 시도.
    /// 분산락을 통해 서버가 늘어나도 동시성 문제 발생하지 않도록 레디슨 분산락 사용.
    @Scheduled(fixedDelay = 5000)
    @DistributeLock(key = "outbox-failed-events")
    public void publishFailedEvents() {

        /// 이벤트 발행은 최대 5회.
        /// 발행횟수가 5회 미만인것만 조회
        List<AuthOutbox> top1000ByStatusOrderByCreatedAtAsc = authOutboxRepo
                .findTop1000ByStatusIsFailed();

        List<Long> authIds = new ArrayList<>();

        for (AuthOutbox authOutbox : top1000ByStatusOrderByCreatedAtAsc) {
            try {

                DomainEvent event = convertValue(authOutbox.getEventType(), authOutbox.getEventValue());

                // 레디스로 발송 -> 발송실패시 try catch로 잡아 해당 캐치로 잡힘.
                authService.publishEvent(event);

                authIds.add(authOutbox.getId());

                /// 100개씩 벌크 업데이트
                if (authIds.size() == 100) {
                    // 발송 성공
                    authOutboxRepo.bulkUpdateOutboxStatus(OutboxStatus.PUBLISHED, authIds);
                    // 리스트 초기화
                    authIds.clear();
                }

            } catch (Exception e) {
                // 에러 발생 시 처리
                authOutboxRepo.updateOutboxStatus(OutboxStatus.FAILED, authOutbox.getId());
                log.error("스케줄러 발송 실패. outbox Id: {}", authOutbox.getId(), e);
            }
        }

        /// 잔여값 벌크업데이트
        if (!authIds.isEmpty()) {
            authOutboxRepo.bulkUpdateOutboxStatus(OutboxStatus.PUBLISHED, authIds);
            authIds.clear();
        }
    }

    // 퍼블리쉬 상태 지우기 (매일 새벽 4시에 발송 성공한지 7일 지난 쓰레기 이벤트 벌크 삭제)
    @Scheduled(cron = "0 0 4 * * ?")
    @DistributeLock(key = "outbox-cleanup-events")
    public void cleanupPublishedEvents() {
        try {
            /// 7일전 데이터
            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(7);

            int deletedCount = authOutboxRepo.deleteOldPublishedEvents(OutboxStatus.PUBLISHED, cutoffDate);
            log.info("아웃박스 발송 완료(PUBLISHED) 데이터 제거, 삭제 건수: {}", deletedCount);

        } catch (Exception e) {
            log.error("아웃박스 발송 완료(PUBLISHED) 데이터 제거중 에러 발생 (스케줄러 에러)", e);
        }
    }

    private DomainEvent convertValue(EventType eventType, String eventValue) throws JsonProcessingException {
        return switch (eventType) {
            case USER_CREATED -> obm.readValue(eventValue, UserCreatedEvent.class);
            case USER_REGIONS_UPSERTED -> obm.readValue(eventValue, UserRegionUpsertedEvent.class);
            case USER_NICKNAME_UPDATED -> obm.readValue(eventValue, UserNicknameUpdatedEvent.class);
            case USER_REGION_DELETED -> obm.readValue(eventValue, UserRegionDeletedEvent.class);
            default -> throw new IllegalArgumentException("확인할 수 없는 타입 : " + eventType);
        };
    }

}
