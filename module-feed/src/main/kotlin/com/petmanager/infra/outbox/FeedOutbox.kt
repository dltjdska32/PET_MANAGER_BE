package com.petmanager.infra.outbox

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

@Document(collection = "feed_outbox")
data class FeedOutbox(
    @Id
    val id: String? = null,

    /// [com.petmanager.application.event.EventType] 이름 (CREATED_FEED 등)
    val eventType: String,

    val payloadJson: String,

    var status: OutboxStatus = OutboxStatus.PENDING,

    var publishedCount: Int = 0,

    val createdAt: Instant = Instant.now(),
)
