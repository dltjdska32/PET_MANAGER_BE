package com.petmanager.application

import com.fasterxml.jackson.databind.ObjectMapper
import com.petmanager.application.event.EventType
import com.petmanager.infra.outbox.FeedChatSyncPayload
import com.petmanager.infra.outbox.FeedOutbox
import com.petmanager.infra.outbox.FeedOutboxRepo
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional

@Service
class FeedChatOutboxWriter(
    private val feedOutboxRepo: FeedOutboxRepo,
    private val objectMapper: ObjectMapper,
) {

    // 몽고 트랜잭션 전파
    /// 아웃박스문서에 json형식으로 value를 담아준다.
    @Transactional(propagation = Propagation.MANDATORY)
    fun enqueue(eventType: EventType, payload: FeedChatSyncPayload) {
        val json = objectMapper.writeValueAsString(payload)
        feedOutboxRepo.save(
            FeedOutbox(
                eventType = eventType.name,
                payloadJson = json,
            ),
        )
    }
}