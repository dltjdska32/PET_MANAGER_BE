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
import { Connection, Model, type ClientSession } from 'mongoose';
import type { RedisStreamConfig, RedisStreamMap } from './redis-stream.config';
import { ChatUser, ChatUserDocument } from '../../model/chat-user.schema';
import { REDIS_STREAM_CLIENT } from './redis-stream.tokens';
import { fieldsToRecord } from './stream-fields.util';
import {
  ChatUserEmbeddedSyncRepo,
  EmbeddedChatUserPatch,
} from '../../model/repo/chat-user-embedded-sync.repo';

export interface UserCreatedEventValue {
  userId: number;
  username?: string;
  email: string;
  nickname: string;
  role?: string;
  userMainImgUrl?: string | null;
  regionIds: number[];
}
export interface UserNicknameUpdatedEventValue {
  userId: number;
  nickname: string;
}
export interface UserRegionUpsertedEventValue {
  userId: number;
  userRegionIds: number[];
}
export interface UserRegionDeletedEventValue {
  userId: number;
  deletedRegionIds: number[];
}
export interface UserProfileImgUpdatedEventValue {
  userId: number;
  userMainImgUrl: string;
}


const EventType = {
  USER_CREATED: 'USER_CREATED',
  USER_NICKNAME_UPDATED: 'USER_NICKNAME_UPDATED',
  USER_REGIONS_UPSERTED: 'USER_REGIONS_UPSERTED',
  USER_REGION_DELETED: 'USER_REGION_DELETED',
  USER_PROFILE_IMG_UPDATED: 'USER_PROFILE_IMG_UPDATED',
} as const;




@Injectable()
export class AuthUserStreamConsumer implements OnModuleInit, OnModuleDestroy {
  
  private readonly logger = new Logger(AuthUserStreamConsumer.name);
  private running = false;
  private loopChain: Promise<void> | undefined;

  constructor(
    @Inject(REDIS_STREAM_CLIENT) private readonly redis: Redis,
    private readonly config: ConfigService,
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(ChatUser.name)
    private readonly chatUserModel: Model<ChatUserDocument>,
    private readonly chatUserEmbeddedSyncRepo: ChatUserEmbeddedSyncRepo,
  ) {}


  /**
   * PEL 재시도 스케줄러용: 본문 반영 후 ACK (실패 시 Redis에 ACK 하지 않음)
   */
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

    const map  = this.config.getOrThrow<RedisStreamMap>('redisStream');

    const cfg = map.streams.auth; 

    /// 컨슈머 꺼져있으면 아무것도 안함.
    if (!cfg.enabled) {
      this.logger.log('Redis stream consumer disabled (REDIS_STREAM_ENABLED=false)');
      return;
    }

    /// 컨슈머 실행
    this.running = true;
    this.loopChain = this.runLoop(cfg).catch((err: unknown) => {
      this.logger.error(
        `Redis stream loop terminated: ${err instanceof Error ? err.message : String(err)}`,
      );
    });
  }




  async onModuleDestroy() {
    this.running = false;
    await this.loopChain?.catch(() => undefined);
    await this.redis.quit().catch(() => undefined);
  }




  /// 레디스 스트림에서 메시지를 읽고 처리  끝나면 ack 처리
  private async runLoop(cfg: RedisStreamConfig) {
    await this.ensureConsumerGroup(cfg.streamKey, cfg.group);

    while (this.running) {

      /// xreadgroup(...) 명령 실행 결과
      // reply = [
      //   [ "auth-events", [                    ← 스트림 1개
      //       [ "id-1", ["eventType","...","value","..."] ],
      //       [ "id-2", ["eventType","...","value","..."] ],
      //     ]
      //   ],
      //   // 다른 스트림이 있으면 또 [...]
      // ]
      let reply: [string, [string, string[]][]][] | null;


      try {


        // xreadgroup(...) (핵심)
        // Redis 명령 XREADGROUP과 같은 역할.
        
        // GROUP + group + consumerName: “이 Consumer Group의 이 소비자 이름으로 읽겠다.”
        // COUNT + count: 한 번에 최대 몇 개까지.
        // BLOCK + blockMs: 새 메시지가 없으면 최대 몇 ms 대기 (long poll).
        // STREAMS + streamKey + '>': > = 이 그룹에 아직 배정 안 된 새 메시지만 읽겠다는 뜻.
        // 반환값 reply가 null이면: 대기 끝났는데 가져온 메시지 없음 → 아래 continue로 다시 폴링.
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
          `XREADGROUP error: ${err instanceof Error ? err.message : String(err)}`,
        );
        continue;
      }

      if (!reply) {
        continue;
      }

      for (const [, messages] of reply) {
        if (!messages) {
          continue;
        }
        for (const [id, fieldsArr] of messages) {
          const fields = fieldsToRecord(fieldsArr);
          try {
            await this.handleFields(fields);
            await this.redis.xack(cfg.streamKey, cfg.group, id);
          } catch (err: unknown) {
            this.logger.error(
              `Failed id=${id}: ${err instanceof Error ? err.message : String(err)}`,
            );
          }
        }
      }
    }
  }




  //이 스트림(streamKey)에 cfg.group 이름의 Consumer Group이 없으면 만들고, 
  // 스트림이 없으면 같이 만듦(MKSTREAM).
  private async ensureConsumerGroup(streamKey: string, group: string) {
    try {
      await this.redis.xgroup(
        'CREATE',
        streamKey,
        group,
        '0',
        'MKSTREAM',
      );
      this.logger.log(`Created consumer group "${group}" on "${streamKey}"`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('BUSYGROUP')) {
        return;
      }
      this.logger.error(`Failed to create consumer group "${group}" on "${streamKey}": ${msg}`);
    }
  }




  private async handleFields(fields: Record<string, string>) {
    const getEventType = fields.eventType;
    const getEventValue = fields.value;

    if (!getEventValue || !getEventType) {
      throw new Error('이벤트 타입 또는 값 확인 불가');
    }

    switch(getEventType) {

      case EventType.USER_CREATED:
        await this.handleUserCreatedEvent(JSON.parse(getEventValue) as UserCreatedEventValue);
        break;

        
      case EventType.USER_REGIONS_UPSERTED:
        await this.handleUserRegionUpsertedEvent(JSON.parse(getEventValue) as UserRegionUpsertedEventValue);
        break;

      case EventType.USER_NICKNAME_UPDATED:
        await this.handleUserNicknameUpdatedEvent(JSON.parse(getEventValue) as UserNicknameUpdatedEventValue);
        break;

      case EventType.USER_REGION_DELETED:
        await this.handleUserRegionDeletedEvent(JSON.parse(getEventValue) as UserRegionDeletedEventValue);
        break;

      case EventType.USER_PROFILE_IMG_UPDATED:
        await this.handleUserProfileImgUpdatedEvent(JSON.parse(getEventValue) as UserProfileImgUpdatedEventValue);
        break;

      default:
        this.logger.error(`확인할 수 없는 이벤트 타입: ${getEventType}`);
    }

  }

  /// 몽고 디비에 저장 (단일 트랜잭션)
  private handleUserCreatedEvent(val: UserCreatedEventValue) {
    return this.connection.transaction(async (session) => {
      const username = val.username ?? `user_${val.userId}`;

      await this.chatUserModel.updateOne(
        { userId: val.userId },
        {
          $set: {
            username,
            userEmail: val.email,
            userNickname: val.nickname,
            userRole: val.role ?? 'ROLE_USER',
            userMainImgUrl: val.userMainImgUrl ?? null,
            userRegionIds: val.regionIds,
            isDeleted: false,
          },
        },
        { upsert: true, session },
      );
    });
  }

  /// 유저 지역 업서트 (단일 트랜잭션)
  private handleUserRegionUpsertedEvent(val: UserRegionUpsertedEventValue) {
    return this.connection.transaction(async (session) => {
      await this.chatUserModel.updateOne(
        { userId: val.userId },
        {
          $set: {
            userRegionIds: val.userRegionIds,
          },
        },
        { upsert: true, session },
      );
    });
  }

  /// 유저 닉네임 업서트 (단일 트랜잭션)
  private handleUserNicknameUpdatedEvent(val: UserNicknameUpdatedEventValue) {
    return this.connection.transaction(async (session) => {
      await this.chatUserModel.updateOne(
        { userId: val.userId },
        {
          $set: {
            userNickname: val.nickname,
          },
        },
        { upsert: true, session },
      );

      await this.syncEmbeddedUserProfile(
        val.userId,
        { userNickname: val.nickname },
        session,
      );
    });
  }

  /// 유저 지역 삭제 (단일 트랜잭션)
  private handleUserRegionDeletedEvent(val: UserRegionDeletedEventValue) {
    return this.connection.transaction(async (session) => {
      await this.chatUserModel.updateOne(
        { userId: val.userId },
        {
          $pull: {
            userRegionIds: { $in: val.deletedRegionIds },
          },
        },
        { session },
      );
    });
  }

  /// 유저 프로필 이미지 변경 (chat_users만 — embedded 필드에 프로필 URL 없음)
  private handleUserProfileImgUpdatedEvent(val: UserProfileImgUpdatedEventValue) {
    return this.connection.transaction(async (session) => {
      await this.chatUserModel.updateOne(
        { userId: val.userId },
        {
          $set: {
            userMainImgUrl: val.userMainImgUrl,
          },
        },
        { upsert: true, session },
      );
    });
  }

  private syncEmbeddedUserProfile(
    userId: number,
    patch: EmbeddedChatUserPatch,
    session?: ClientSession,
  ): Promise<void> {
    return this.chatUserEmbeddedSyncRepo.syncEmbeddedUserProfile(
      userId,
      patch,
      session,
    );
  }

}
