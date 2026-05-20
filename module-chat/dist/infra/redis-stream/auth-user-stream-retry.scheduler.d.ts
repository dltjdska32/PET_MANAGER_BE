import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { AuthUserStreamConsumer } from './auth-user-stream.consumer';
export declare class AuthUserStreamRetryScheduler implements OnModuleInit, OnModuleDestroy {
    private readonly redis;
    private readonly config;
    private readonly authUserConsumer;
    private readonly logger;
    private interval?;
    private tickRunning;
    constructor(redis: Redis, config: ConfigService, authUserConsumer: AuthUserStreamConsumer);
    onModuleInit(): void;
    onModuleDestroy(): void;
    private tick;
    private runRetryRound;
    private parsePending;
    private parseClaimed;
    private moveToDlqAndAck;
}
