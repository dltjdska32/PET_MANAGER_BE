package com.petmanager.infra.outbox;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.repository.query.Param;

public interface AuthOutboxRepo extends JpaRepository<AuthOutbox, Long> {
    // 상위 1000건까지 조회 (JPQL LIMIT 불가하므로 메서드 쿼리 사용)
    List<AuthOutbox> findTop1000ByStatusOrderByCreatedAtAsc(OutboxStatus status);

    @Query("SELECT au " +
            "FROM AuthOutbox au " +
            "WHERE au.status = 'FAILED' " +
            "AND   au.publishedCount < 5 " +
            "ORDER BY au.createdAt ASC")
    List<AuthOutbox> findTop1000ByStatusIsFailed();

    // 발송 완료된지 오래된 아웃박스 데이터를 뭉텅이(Bulk)로 날려버리는 쿼리
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Transactional
    @Query("DELETE FROM AuthOutbox au " +
            "WHERE au.status = :status " +
            "AND au.createdAt < :cutoffDate")
    int deleteOldPublishedEvents(@Param("status") OutboxStatus status, @Param("cutoffDate") LocalDateTime cutoffDate);



    /// 발행상태업데이트
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Transactional
    @Query("UPDATE AuthOutbox au " +
            "SET au.status = :status " +
            ",   au.publishedCount = au.publishedCount + 1 " +
            "WHERE au.id = :outboxId ")
    int updateOutboxStatus(@Param("status") OutboxStatus status, @Param("outboxId") Long outboxId);


    /// 벌크발행상태업데이트
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Transactional
    @Query("UPDATE AuthOutbox au " +
            "SET au.status = :status " +
            ",   au.publishedCount = au.publishedCount + 1 " +
            "WHERE au.id IN :outboxIds ")
    int bulkUpdateOutboxStatus(@Param("status") OutboxStatus status, @Param("outboxIds") List<Long> outboxIds);
}
