package com.petmanager.infra.event

import com.petmanager.config.GlobalConst
import org.slf4j.LoggerFactory
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Component
import java.util.HashMap

/**
 * 피드 → 챗 동기화용 Redis Stream (필드: eventType, value).
 */
@Component
class FeedChatStreamPublisher(
    private val stringRedisTemplate: StringRedisTemplate,
) {

    private val log = LoggerFactory.getLogger(FeedChatStreamPublisher::class.java)

    fun publish(eventType: String, value: String) {
        try {
            val body = HashMap<String, String>()
            body["eventType"] = eventType
            body["value"] = value
            stringRedisTemplate.opsForStream<String, String>()
                .add(GlobalConst.FEED_CHAT_STREAM_KEY, body)
        } catch (e: Exception) {
            log.error("feed-chat 스트림 발행 실패 eventType={}", eventType, e)
            throw e
        }
    }
}
