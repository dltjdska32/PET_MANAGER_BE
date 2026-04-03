package com.petmanager.infra.event

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import com.petmanager.domain.FeedUser
import com.petmanager.infra.mongo.FeedUserRepo
import org.slf4j.LoggerFactory
import org.springframework.data.redis.connection.stream.MapRecord
import org.springframework.data.redis.stream.StreamListener
import org.springframework.stereotype.Component

@Component
class UserStreamListener(
    private val feedUserRepo: FeedUserRepo,
    private val objectMapper: ObjectMapper
) : StreamListener<String, MapRecord<String, String, String>> {

    private val log = LoggerFactory.getLogger(javaClass)

    override fun onMessage(message: MapRecord<String, String, String>) {
        val map = message.value
        val eventType = map["eventType"]
        val eventValue = map["value"]

        if (eventValue == null || eventType == null) {
            log.warn("수신된 스트림 메시지 형식이 잘못되었습니다: {}", map)
            return
        }

        try {
            // ✅ auth-events 에서 USER_CREATED 이벤트 수신 시 MongoDB에 유저 정보 캐싱 (Upsert)
            if (eventType == "USER_CREATED") {
                val jsonNode = objectMapper.readTree(eventValue)
                val userId = jsonNode.get("userId")?.asLong() ?: return

                // UserCreatedEvent 구조에 맞게 (email, nickname, regionIds) 추출
                val email = jsonNode.get("email")?.asText() ?: ""
                val nickname = jsonNode.get("nickname")?.asText() ?: "unknown"

                val regionIdsNode = jsonNode.get("regionIds")
                val regionIds: List<Long> = if (regionIdsNode != null && regionIdsNode.isArray) {
                    objectMapper.convertValue(regionIdsNode, object : TypeReference<List<Long>>() {})
                } else {
                    emptyList()
                }

                log.info("📢 Redis Stream 수신 (USER_CREATED): 유저ID={}, 이메일={}, 닉네임={}, 관할지역수={}", userId, email, nickname, regionIds.size)

                feedUserRepo.save(
                    FeedUser(
                        userId = userId,
                        email = email,
                        nickname = nickname,
                        regionIds = regionIds
                    )
                )
            }

            // 추가: 닉네임 변경 등 다른 이벤트가 들어오면 여기서 분기 가능함.
            // else if (eventType == "USER_NICKNAME_UPDATED") { ... }

        } catch (e: Exception) {
            log.error("Redis Stream 유저 메시지 역직렬화 및 저장 실패 - eventValue: {}", eventValue, e)
        }
    }
}