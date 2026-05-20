export interface RedisStreamConfig {
    streamKey: string;
    group: string;
    consumerName: string;
    blockMs: number;
    count: number;
    enabled: boolean;
}
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
declare const _default: (() => RedisStreamMap) & import("@nestjs/config").ConfigFactoryKeyHost<RedisStreamMap>;
export default _default;
