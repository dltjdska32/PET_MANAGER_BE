import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { FeedSyncStreamConsumer } from './feed-sync-stream.consumer';
export declare class FeedSyncStreamRetryScheduler implements OnModuleInit, OnModuleDestroy {
    private readonly redis;
    private readonly config;
    private readonly feedSyncConsumer;
    private readonly logger;
    private interval?;
    private tickRunning;
    constructor(redis: Redis, config: ConfigService, feedSyncConsumer: FeedSyncStreamConsumer);
    onModuleInit(): void;
    onModuleDestroy(): void;
    private tick;
    private feedDlqKey;
    private runRetryRound;
    private parsePending;
    private parseClaimed;
    private moveToDlqAndAck;
}
