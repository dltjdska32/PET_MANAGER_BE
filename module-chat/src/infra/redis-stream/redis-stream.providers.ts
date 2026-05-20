import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import type {  RedisStreamMap } from './redis-stream.config';
import { REDIS_STREAM_CLIENT } from './redis-stream.tokens';

/// 레디스 스트림 클라이언트 생성 프로바이더
export const redisStreamClientProvider = {
  /// DI REDIS_STREAM_CLIENT 심볼로 정의하여 주입받을 수 있도록 함.
  provide: REDIS_STREAM_CLIENT,
  
  useFactory: (config: ConfigService) => {

    const cfg = config.getOrThrow<RedisStreamMap>('redisStream');
    return new Redis(cfg.url, {
      maxRetriesPerRequest: null,
    });
  },

  /// ConfigService 프로바이더에서 설정값을 주입받음.
  inject: [ConfigService],
};
