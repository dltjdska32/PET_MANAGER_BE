import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
export declare const redisStreamClientProvider: {
    provide: symbol;
    useFactory: (config: ConfigService) => Redis;
    inject: (typeof ConfigService)[];
};
