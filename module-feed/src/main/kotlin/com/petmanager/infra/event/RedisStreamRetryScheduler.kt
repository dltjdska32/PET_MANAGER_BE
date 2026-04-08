package com.petmanager.infra.event

import com.petmanager.config.GlobalConst
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.domain.Range
import org.springframework.data.redis.connection.stream.RecordId
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.time.Duration

/**
 * Redis Stream Consumer Group PEL(pending) 재처리 워커.
 *
 * - 성공: XACK
 * - 실패: ACK하지 않고 PEL에 남김 (다음 라운드에 reclaim 대상)
 * - 최대 재시도 초과: DLQ 스트림으로 이동 후 XACK
 */
@Component
class RedisStreamRetryScheduler(
    private val stringRedisTemplate: StringRedisTemplate,
    private val userStreamListener: UserStreamListener,
    @Value("\${redis.stream.retry.consumer:feed-consumer-retry-1}")
    private val retryConsumerName: String,
    @Value("\${redis.stream.retry.batch-size:50}")
    private val batchSize: Long,
    @Value("\${redis.stream.retry.min-idle-ms:60000}")
    private val minIdleMs: Long,
    @Value("\${redis.stream.retry.max-deliveries:10}")
    private val maxDeliveries: Long,
    @Value("\${redis.stream.retry.dlq-stream-key:auth-events-dlq}")
    private val dlqStreamKey: String,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @Scheduled(fixedDelayString = "\${redis.stream.retry.fixed-delay-ms:5000}")
    fun retryPending() {
        val ops = stringRedisTemplate.opsForStream<String, String>()

        /*
        * Spring Data Redis가 내부적으로 Redis 명령 XPENDING을 날려
        * 스트림 키: auth-events
        * 그룹:     feed-service-group
        * 범위:     - ~ + (전체)
        * 개수:     batchSize
        * 만큼 Pending 목록을 가져오는 것
        * */
        val pendingMessages = try {
            ops.pending(
                GlobalConst.AUTH_STREAM_KEY,
                GlobalConst.FEED_CONSUMER_GROUP,
                Range.closed("-", "+"),
                batchSize
            )
        } catch (e: Exception) {
            log.error("Redis Stream PENDING 조회 실패", e)
            return
        }

        if (pendingMessages.isEmpty()) return

        val nowRetryIds = ArrayList<RecordId>()

        for (p in pendingMessages) {
            /// consumer group에 지금까지 몇 번 전달 됐는지(재시도/재전달 포함)  - 전달 횟수 카운터
            val deliveries = p.totalDeliveryCount

            /// 어떤 consumer에게 전달된 이후 얼마나 시간이 흘렀는지(ms)
            val idleMs = p.elapsedTimeSinceLastDelivery.toMillis()

            // 재시도가 특정횟수 이상일경우 dlq로 보내고 ack처리
            if (deliveries >= maxDeliveries) {
                moveToDlqAndAck(p.id, deliveries, idleMs)
                continue
            }

            // 오래 방치된 pending만 재시도 대상으로 선정
            if (idleMs >= minIdleMs) {
                nowRetryIds.add(p.id)
            }
        }

        if (nowRetryIds.isEmpty()) return



        /*
        * 내부적으로 Redis 명령 XCLAIM을 날려서,
        * “이 pending 메시지들을 다른 consumer가 들고 있던 걸 내가 가져와서(소유권 변경) 다시 처리하겠다”를 하는 함수야.
        * 파라미터 의미는:
        * AUTH_STREAM_KEY = 어떤 스트림에서
        * FEED_CONSUMER_GROUP = 어떤 그룹의 pending을
        * retryConsumerName = 어느 consumer에게 넘길지
        *    Duration.ofMillis(minIdleMs) = 이만큼 idle 이상인 것만 claim 가능(중복 방지)
        *   ids... = 어떤 메시지 id들을 claim할지
        *   그리고 claim()의 리턴은 실제 메시지 본문(MapRecord) 까지 같이 돌려줘서, 바로 처리할 수 있음.
        * */
        val claimed = try {
            ops.claim(
                GlobalConst.AUTH_STREAM_KEY,
                GlobalConst.FEED_CONSUMER_GROUP,
                retryConsumerName,
                Duration.ofMillis(minIdleMs),
                *nowRetryIds.toTypedArray()
            )
        } catch (e: Exception) {
            log.error("Redis Stream CLAIM 실패", e)
            return
        }

        if (claimed.isEmpty()) return

        log.info("Redis Stream pending reclaim count={}", claimed.size)

        // 재처리는 기존 리스너 로직을 그대로 재사용 (리스너 내부에서 성공 시 ACK 처리)
        claimed.forEach { record ->
            userStreamListener.onMessage(record)
        }
    }

    private fun moveToDlqAndAck(id: RecordId, deliveries: Long, idleMs: Long) {
        val ops = stringRedisTemplate.opsForStream<String, String>()

        val claimed = try {
            ops.claim(
                GlobalConst.AUTH_STREAM_KEY,
                GlobalConst.FEED_CONSUMER_GROUP,
                retryConsumerName,
                Duration.ZERO,
                id
            )
        } catch (e: Exception) {
            log.error("DLQ 이동을 위한 CLAIM 실패 - recordId={}", id, e)
            return
        }

        if (claimed.isEmpty()) {
            return
        }

        val record = claimed.first()
        val value = record.value
        val eventType = value["eventType"] ?: "UNKNOWN"
        val eventValue = value["value"] ?: ""

        try {
            ops.add(
                dlqStreamKey,
                mapOf(
                    "originalStream" to GlobalConst.AUTH_STREAM_KEY,
                    "originalGroup" to GlobalConst.FEED_CONSUMER_GROUP,
                    "originalId" to id.value,
                    "eventType" to eventType,
                    "value" to eventValue,
                    "deliveries" to deliveries.toString(),
                    "idleMs" to idleMs.toString(),
                )
            )

            ops.acknowledge(GlobalConst.AUTH_STREAM_KEY, GlobalConst.FEED_CONSUMER_GROUP, id)

            log.warn(
                "Redis Stream DLQ moved and ACKed - id={}, eventType={}, deliveries={}, idleMs={}",
                id.value,
                eventType,
                deliveries,
                idleMs
            )
        } catch (e: Exception) {
            log.error("DLQ 이동/ACK 실패 - recordId={}", id, e)
        }
    }
}

