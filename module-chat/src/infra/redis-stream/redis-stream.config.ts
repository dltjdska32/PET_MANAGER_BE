import { registerAs } from '@nestjs/config';
import { GlobalConst } from 'src/config';

/// 레디스 스트림 설정.
export interface RedisStreamConfig {
  streamKey: string;
  group: string;
  consumerName: string;
  blockMs: number;
  count: number;
  enabled: boolean;
}

/// PEL 재처리 / DLQ (module-feed 의 RedisStreamRetryScheduler 와 동일한 의미의 설정)
export interface RedisStreamRetryConfig {
  enabled: boolean;
  consumerName: string;
  batchSize: number;
  minIdleMs: number;
  maxDeliveries: number;
  fixedDelayMs: number;
  dlqStreamKey: string;
}

export interface RedisStreamMap {
  url: string;
  streams: Record<string, RedisStreamConfig>;
  retry: RedisStreamRetryConfig;
}

export default registerAs(
  'redisStream',
  (): RedisStreamMap => ({

    url: process.env.REDIS_URL ?? 'redis://127.0.0.1:6379',

    streams: {

      auth: {
        streamKey: GlobalConst.AUTH_STREAM_KEY,
        group: GlobalConst.CHAT_CONSUMER_GROUP,
        consumerName: GlobalConst.CHAT_CONSUMER_GROUP_NAME,
        blockMs: 5000,  /// 새메시지 없으면 5초 대기
        count: 50,      /// 한번에 최대 50개의 메시지를 읽음
        enabled: process.env.REDIS_STREAM_ENABLED !== 'false',
      },

      feedSync: {
        streamKey: GlobalConst.FEED_CHAT_STREAM_KEY,
        group: GlobalConst.CHAT_FEED_SYNC_GROUP,
        consumerName: GlobalConst.CHAT_FEED_SYNC_CONSUMER_NAME,
        blockMs: 5000,
        count: 50,
        enabled: process.env.REDIS_FEED_STREAM_ENABLED !== 'false',
      },
    },

    retry: {
      enabled: process.env.REDIS_STREAM_RETRY_ENABLED !== 'false',
      consumerName:
        process.env.REDIS_STREAM_RETRY_CONSUMER ?? 'chat-consumer-retry-1',
      batchSize: Number(process.env.REDIS_STREAM_RETRY_BATCH_SIZE ?? 50),
      minIdleMs: Number(process.env.REDIS_STREAM_RETRY_MIN_IDLE_MS ?? 60_000), /// minidle 60초
      maxDeliveries: Number(
        process.env.REDIS_STREAM_RETRY_MAX_DELIVERIES ?? 10, /// 최대시도 10회
      ),
      fixedDelayMs: Number(
        process.env.REDIS_STREAM_RETRY_FIXED_DELAY_MS ?? 5000,
      ),
      dlqStreamKey:
        process.env.REDIS_STREAM_RETRY_DLQ_STREAM_KEY ??
        'auth-events-dlq-chat',
    },
  }),
);
