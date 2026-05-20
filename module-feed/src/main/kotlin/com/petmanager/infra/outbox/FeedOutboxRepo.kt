package com.petmanager.infra.outbox

import org.springframework.data.mongodb.repository.MongoRepository
import java.time.Instant

interface FeedOutboxRepo : MongoRepository<FeedOutbox, String> {

    fun findTop1000ByStatusOrderByCreatedAtAsc(status: OutboxStatus): List<FeedOutbox>

    fun findTop1000ByStatusAndPublishedCountLessThanOrderByCreatedAtAsc(
        status: OutboxStatus,
        publishedCount: Int,
    ): List<FeedOutbox>

    fun deleteAllByStatusAndCreatedAtBefore(status: OutboxStatus, cutoff: Instant): Long
}