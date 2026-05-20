import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './infra/redis-pub-sub/redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

   /// 레디스 어뎁터 설정 추가 (펍섭 사용)
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connToRedis();
  app.useWebSocketAdapter(redisIoAdapter);
  
  app.setGlobalPrefix('api/chat');
  await app.listen(8083);
}
void bootstrap();
