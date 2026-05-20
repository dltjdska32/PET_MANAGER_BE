import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import Redis from 'ioredis';
import { Connection, Model } from 'mongoose';
import type { RedisStreamConfig, RedisStreamMap } from './redis-stream.config';
import { FeedSync, FeedSyncDocument } from '../../model/feed-sync.schema';
import {
  buildChatRoomFeedInfoSet,
  buildFeedSyncDocumentSet,
  type FeedChatSyncPayload,
} from '../../model/feed-snapshot.util';
import { REDIS_STREAM_CLIENT } from './redis-stream.tokens';
import { fieldsToRecord } from './stream-fields.util';
import { ChatRoom, ChatRoomDocument } from 'src/model/chat-rooms.schema';

const FeedStreamEventType = {
  CREATED_FEED: 'CREATED_FEED',
  UPDATED_FEED: 'UPDATED_FEED',
  DELETED_FEED: 'DELETED_FEED',
} as const;

@Injectable()
export class FeedSyncStreamConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FeedSyncStreamConsumer.name);
  private running = false;
  private loopChain: Promise<void> | undefined;

  constructor(
    @Inject(REDIS_STREAM_CLIENT) private readonly redis: Redis,
    private readonly config: ConfigService,
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(FeedSync.name)
    private readonly feedSyncModel: Model<FeedSyncDocument>,
    @InjectModel(ChatRoom.name)
    private readonly chatRoomModel: Model<ChatRoomDocument>,
  ) {}

  async processMessageWithAck(
    streamKey: string,
    group: string,
    messageId: string,
    fields: Record<string, string>,
  ): Promise<void> {
    await this.handleFields(fields);
    await this.redis.xack(streamKey, group, messageId);
  }

  onModuleInit() {
    const map = this.config.getOrThrow<RedisStreamMap>('redisStream');
    const cfg = map.streams.feedSync;

    if (!cfg.enabled) {
      this.logger.log(
        'Feed sync Redis stream consumer off (REDIS_FEED_STREAM_ENABLED=false)',
      );
      return;
    }

    this.running = true;
    this.loopChain = this.runLoop(cfg).catch((err: unknown) => {
      this.logger.error(
        `Feed sync stream loop terminated: ${err instanceof Error ? err.message : String(err)}`,
      );
    });
  }

  async onModuleDestroy() {
    this.running = false;
    await this.loopChain?.catch(() => undefined);
  }

  private async runLoop(cfg: RedisStreamConfig) {
    await this.ensureConsumerGroup(cfg.streamKey, cfg.group);

    while (this.running) {
      let reply: [string, [string, string[]][]][] | null;
      try {
        reply = (await this.redis.xreadgroup(
          'GROUP',
          cfg.group,
          cfg.consumerName,
          'COUNT',
          cfg.count,
          'BLOCK',
          cfg.blockMs,
          'STREAMS',
          cfg.streamKey,
          '>',
        )) as [string, [string, string[]][]][] | null;
      } catch (err: unknown) {
        this.logger.warn(
          `Feed sync XREADGROUP error: ${err instanceof Error ? err.message : String(err)}`,
        );
        continue;
      }

      if (!reply) {
        continue;
      }

      for (const [, messages] of reply) {
        if (!messages) continue;
        for (const [id, fieldsArr] of messages) {
          const fields = fieldsToRecord(fieldsArr);
          try {
            await this.handleFields(fields);
            await this.redis.xack(cfg.streamKey, cfg.group, id);
          } catch (err: unknown) {
            this.logger.error(
              `Feed sync failed id=${id}: ${err instanceof Error ? err.message : String(err)}`,
            );
          }
        }
      }
    }
  }

  private async ensureConsumerGroup(streamKey: string, group: string) {
    try {
      await this.redis.xgroup('CREATE', streamKey, group, '0', 'MKSTREAM');
      this.logger.log(`Created consumer group "${group}" on "${streamKey}"`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('BUSYGROUP')) {
        return;
      }
      this.logger.error(
        `Failed to create consumer group "${group}" on "${streamKey}": ${msg}`,
      );
    }
  }

  private async handleFields(fields: Record<string, string>) {
    const eventType = fields.eventType;
    const raw = fields.value;
    
    if (!raw || !eventType) {
      throw new Error('feed-chat 이벤트 타입 또는 값 없음');
    }

    const payload = JSON.parse(raw) as FeedChatSyncPayload;

    switch (eventType) {
      case FeedStreamEventType.CREATED_FEED:
        await this.upsertFeedSync(payload);
        break;

      case FeedStreamEventType.UPDATED_FEED:
        await this.upsertFeedSync(payload);
        await this.updateChatRoomByUpdatedFeed(payload);
        break;

      case FeedStreamEventType.DELETED_FEED:
        await this.upsertFeedSync(payload);
        break;

      default:
        this.logger.error(`알 수 없는 feed-chat 이벤트: ${eventType}`);
    }
  }


  /// 피드 수정 시 채팅방 feedInfo 임베디드 전체 스냅샷 반영
  private async updateChatRoomByUpdatedFeed(payload: FeedChatSyncPayload) {
    await this.connection.transaction(async (session) => {
      await this.chatRoomModel.updateMany(
        { 'feedInfo.feedId': payload.id, isDeleted: false },
        {
          $set: {
            ...buildChatRoomFeedInfoSet(payload),
            updatedAt: new Date(),
          },
        },
        { session },
      );
    });
  }

  /// feed_sync 전체 스냅샷 upsert
  private async upsertFeedSync(payload: FeedChatSyncPayload) {
    await this.connection.transaction(async (session) => {
      await this.feedSyncModel.updateOne(
        { feedId: payload.id },
        {
          $set: buildFeedSyncDocumentSet(payload),
        },
        { upsert: true, session },
      );
    });
  }
}
