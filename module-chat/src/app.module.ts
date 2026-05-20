import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { GlobalExceptionFilter } from './config/exception/global-exception.filter';
import redisStreamConfig from './infra/redis-stream/redis-stream.config';
import { ChatGateway } from './controller/chat.gateway';
import { ChatUser, ChatUserSchema } from './model/chat-user.schema';
import { ChatRoom, ChatRoomSchema } from './model/chat-rooms.schema';
import { ChatLog, ChatLogSchema } from './model/chat-logs.schema';
import { FeedSync, FeedSyncSchema } from './model/feed-sync.schema';
import { ChatController } from './controller/chat.controller';
import { AuthUserStreamConsumer } from './infra/redis-stream/auth-user-stream.consumer';
import { AuthUserStreamRetryScheduler } from './infra/redis-stream/auth-user-stream-retry.scheduler';
import { FeedSyncStreamConsumer } from './infra/redis-stream/feed-sync-stream.consumer';
import { FeedSyncStreamRetryScheduler } from './infra/redis-stream/feed-sync-stream-retry.scheduler';
import { redisStreamClientProvider } from './infra/redis-stream/redis-stream.providers';
import { ChatService } from './service/chat.service';
import { ChatRoomsRepo } from './model/repo/chat-rooms.repo';
import { ChatLogsRepo } from './model/repo/chat-logs.repo';
import { FeedSyncRepo } from './model/repo/feed-sync.repo';
import { s3ClientProvider, s3Config, S3StorageService } from './infra/s3';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule} from '@nestjs/jwt';
import { ChatUserService } from './service/chat-user.service';
import { ChatUserRepo } from './model/repo/chat-user.repo';
import { ChatUserEmbeddedSyncRepo } from './model/repo/chat-user-embedded-sync.repo';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [redisStreamConfig, s3Config], 
    }),
    EventEmitterModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: ChatUser.name, schema: ChatUserSchema },
      { name: ChatLog.name, schema: ChatLogSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: FeedSync.name, schema: FeedSyncSchema },
    ]),
  ],
  controllers: [ChatController],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    redisStreamClientProvider,
    AuthUserStreamConsumer,
    AuthUserStreamRetryScheduler,
    FeedSyncStreamConsumer,
    FeedSyncStreamRetryScheduler,
    ChatGateway,
    ChatService,
    ChatUserService,
    ChatUserRepo,
    ChatUserEmbeddedSyncRepo,
    ChatRoomsRepo,
    ChatLogsRepo,
    FeedSyncRepo,
    s3ClientProvider, 
    S3StorageService, 
  ],
})
export class AppModule {}
