package com.petmanager.infra.event

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import com.petmanager.application.FeedEventService
import com.petmanager.config.GlobalConst
import com.petmanager.domain.FeedUser
import org.slf4j.LoggerFactory
import org.springframework.data.redis.connection.stream.MapRecord
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.data.redis.stream.StreamListener
import org.springframework.stereotype.Component

@Component
class UserStreamListener(
    private val feedEventService: FeedEventService,
    private val objectMapper: ObjectMapper,
    private val stringRedisTemplate: StringRedisTemplate,
) : StreamListener<String, MapRecord<String, String, String>> {

    private val log = LoggerFactory.getLogger(javaClass)

    override fun onMessage(message: MapRecord<String, String, String>) {
        val map = message.value
        val eventType = map["eventType"]
        val eventValue = map["value"]

        // 형식이 깨진 메시지는 재처리해도 의미 없으므로 ACK 처리
        if (eventValue == null || eventType == null) {
            log.warn("수신된 스트림 메시지 .형식이 잘못되었습니다: {}", map)
            ack(message)
            return
        }

        try {

            val jsonNode = objectMapper.readTree(eventValue)

            // auth-events 에서 USER_CREATED 이벤트 수신 시 MongoDB에 유저 정보 캐싱 (Upsert)
            if (eventType == UserEventType.USER_CREATED.name) {

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

                feedEventService.createdUserEvent(
                    FeedUser(
                        userId = userId,
                        email = email,
                        nickname = nickname,
                        regionIds = regionIds
                    )
                )
            }

            if (eventType == UserEventType.USER_REGION_DELETED.name) {

                val jsonNode = objectMapper.readTree(eventValue)
                val userId = jsonNode.get("userId")?.asLong() ?: return

                val getRegionIds = jsonNode.get("deletedRegionIds")
                val regionIds: List<Long> = if (getRegionIds != null && getRegionIds.isArray) {
                    objectMapper.convertValue(getRegionIds, object : TypeReference<List<Long>>() {})
                } else {
                    emptyList()
                }

                feedEventService.userRegionDeletedEvent(userId, regionIds)
            }

            if (eventType == UserEventType.USER_NICKNAME_UPDATED.name) {
                val jsonNode = objectMapper.readTree(eventValue)
                val userId = jsonNode.get("userId")?.asLong() ?: return
                val nickName = jsonNode.get("nickname")?.asText() ?: "unknown"

                feedEventService.userNicknameUpdatedEvent(userId, nickName)
            }

            if (eventType == UserEventType.USER_REGIONS_UPSERTED.name) {

                val jsonNode = objectMapper.readTree(eventValue)
                val userId = jsonNode.get("userId")?.asLong() ?: return

                val getRegionIds = jsonNode.get("userRegionIds")
                val regionIds: List<Long> = if (getRegionIds != null && getRegionIds.isArray) {
                    objectMapper.convertValue(getRegionIds, object : TypeReference<List<Long>>() {})
                } else {
                    emptyList()
                }

                feedEventService.userRegionUpsertedEvent(userId, regionIds)
            }

            // 처리 성공으로  ACK 처리
            ack(message)

        } catch (e: Exception) {

            // 실패 시 ACK 하지 않음  재처리 대상
            log.error("Redis Stream 유저 메시지 역직렬화 및 저장 실패 - eventValue: {}", eventValue, e)
        }
    }

    private fun ack(message: MapRecord<String, String, String>) {
        try {
            stringRedisTemplate.opsForStream<String, String>()
                .acknowledge(GlobalConst.AUTH_STREAM_KEY, GlobalConst.FEED_CONSUMER_GROUP, message.id)
        } catch (e: Exception) {
            log.error("Redis Stream ACK 실패 - recordId={}", message.id, e)
        }
    }
}