"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
const config_2 = require("../../config");
exports.default = (0, config_1.registerAs)('redisStream', () => ({
    url: process.env.REDIS_URL ?? 'redis://127.0.0.1:6379',
    streams: {
        auth: {
            streamKey: config_2.GlobalConst.AUTH_STREAM_KEY,
            group: config_2.GlobalConst.CHAT_CONSUMER_GROUP,
            consumerName: config_2.GlobalConst.CHAT_CONSUMER_GROUP_NAME,
            blockMs: 5000,
            count: 50,
            enabled: process.env.REDIS_STREAM_ENABLED !== 'false',
        },
        feedSync: {
            streamKey: config_2.GlobalConst.FEED_CHAT_STREAM_KEY,
            group: config_2.GlobalConst.CHAT_FEED_SYNC_GROUP,
            consumerName: config_2.GlobalConst.CHAT_FEED_SYNC_CONSUMER_NAME,
            blockMs: 5000,
            count: 50,
            enabled: process.env.REDIS_FEED_STREAM_ENABLED !== 'false',
        },
    },
    retry: {
        enabled: process.env.REDIS_STREAM_RETRY_ENABLED !== 'false',
        consumerName: process.env.REDIS_STREAM_RETRY_CONSUMER ?? 'chat-consumer-retry-1',
        batchSize: Number(process.env.REDIS_STREAM_RETRY_BATCH_SIZE ?? 50),
        minIdleMs: Number(process.env.REDIS_STREAM_RETRY_MIN_IDLE_MS ?? 60_000),
        maxDeliveries: Number(process.env.REDIS_STREAM_RETRY_MAX_DELIVERIES ?? 10),
        fixedDelayMs: Number(process.env.REDIS_STREAM_RETRY_FIXED_DELAY_MS ?? 5000),
        dlqStreamKey: process.env.REDIS_STREAM_RETRY_DLQ_STREAM_KEY ??
            'auth-events-dlq-chat',
    },
}));
//# sourceMappingURL=redis-stream.config.js.map