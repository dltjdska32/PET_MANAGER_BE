package com.petmanager.infra.scheduler

import com.petmanager.config.lock.DistributeLock
import com.petmanager.infra.event.FeedChatStreamPublisher
import com.petmanager.infra.outbox.FeedOutboxRepo
import com.petmanager.infra.outbox.FeedOutbox
import com.petmanager.infra.outbox.OutboxStatus
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.time.Instant
import java.time.temporal.ChronoUnit

/**
 * 백그라운드에서 아웃박스 조회해서 피드스트림에 이벤트 발행.
 */
@Component
class FeedChatOutboxPublishScheduler(
    private val feedOutboxRepo: FeedOutboxRepo,
    private val feedChatStreamPublisher: FeedChatStreamPublisher,
) {

    private val log = LoggerFactory.getLogger(FeedChatOutboxPublishScheduler::class.java)

    ///1초 마다 pending 상태 조회.
    @Scheduled(fixedDelay = 1000)
    @DistributeLock(key = "feed-chat-outbox-pending")
    fun publishPendingEvents() {
        val batch = feedOutboxRepo.findTop1000ByStatusOrderByCreatedAtAsc(OutboxStatus.PENDING)
        for (box in batch) {
            processOne(box)
        }
    }

    @Scheduled(fixedDelay = 5000)
    @DistributeLock(key = "feed-chat-outbox-failed")
    fun publishFailedEvents() {
        val batch = feedOutboxRepo.findTop1000ByStatusAndPublishedCountLessThanOrderByCreatedAtAsc(
            OutboxStatus.FAILED,
            MAX_PUBLISH_ATTEMPTS,
        )
        for (box in batch) {
            processOne(box)
        }
    }

    @Scheduled(cron = "0 0 4 * * ?")
    @DistributeLock(key = "feed-chat-outbox-cleanup")
    fun cleanupPublishedEvents() {
        try {
            val cutoff = Instant.now().minus(7, ChronoUnit.DAYS)
            val removed = feedOutboxRepo.deleteAllByStatusAndCreatedAtBefore(OutboxStatus.PUBLISHED, cutoff)
            log.info("feed_outbox PUBLISHED 정리 삭제 건수={}", removed)
        } catch (e: Exception) {
            log.error("feed_outbox 정리 스케줄러 오류", e)
        }
    }


    /// 성공 실패별로 outbox갱신.
    private fun processOne(box: FeedOutbox) {
        try {
            feedChatStreamPublisher.publish(box.eventType, box.payloadJson)
            box.status = OutboxStatus.PUBLISHED
            box.publishedCount += 1
            feedOutboxRepo.save(box)
        } catch (e: Exception) {
            box.status = OutboxStatus.FAILED
            box.publishedCount += 1
            feedOutboxRepo.save(box)
            log.error("feed-chat outbox 발행 실패 id={}", box.id, e)
        }
    }

    companion object {
        private const val MAX_PUBLISH_ATTEMPTS = 5
    }
}
