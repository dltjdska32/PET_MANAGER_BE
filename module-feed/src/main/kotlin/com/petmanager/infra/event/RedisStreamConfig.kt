package com.petmanager.infra.event

import com.petmanager.config.GlobalConst
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.redis.connection.RedisConnectionFactory
import org.springframework.data.redis.connection.stream.Consumer
import org.springframework.data.redis.connection.stream.ReadOffset
import org.springframework.data.redis.connection.stream.StreamOffset
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.data.redis.stream.StreamMessageListenerContainer
import org.springframework.data.redis.stream.Subscription
import java.time.Duration

@Configuration
class RedisStreamConfig(
    @Value("\${redis.stream.subscribe.consumer}")
    private val consumerName: String,
    private val userStreamListener: UserStreamListener,
    private val stringRedisTemplate: StringRedisTemplate
) {

    private val log = LoggerFactory.getLogger(javaClass)

    @Bean
    fun subscription(factory: RedisConnectionFactory): Subscription {

        // 애플리케이션 시작 시 스트림 그룹이 존재하지 않으면 에러 발생하기 때문에 명시적으로 생성
        try {
            stringRedisTemplate.opsForStream<String, String>().createGroup(GlobalConst.AUTH_STREAM_KEY, GlobalConst.FEED_CONSUMER_GROUP)
            log.info("Consumer Group 생성 성공: {}", GlobalConst.FEED_CONSUMER_GROUP)
        } catch (e: Exception) {
            // 그룹이 이미 존재하는 경우 발생하는 예외 - 무시해도 됨
            log.info("Redis Stream Consumer Group 이 이미 존재합니다: {}", GlobalConst.FEED_CONSUMER_GROUP)
        }

        val options = StreamMessageListenerContainer.StreamMessageListenerContainerOptions
            .builder()
            .pollTimeout(Duration.ofSeconds(1))
            .build()

        val container = StreamMessageListenerContainer.create(factory, options)

        // auth-events 스트림을 구독한다.
        val subscription = container.receive(
            Consumer.from(GlobalConst.FEED_CONSUMER_GROUP, consumerName),
            StreamOffset.create(GlobalConst.AUTH_STREAM_KEY, ReadOffset.lastConsumed()),
            userStreamListener
        )

        container.start()
        return subscription
    }
}