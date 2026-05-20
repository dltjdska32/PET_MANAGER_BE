import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Connection, Model } from 'mongoose';
import { FeedSyncDocument } from '../../model/feed-sync.schema';
import { ChatRoomDocument } from "../../model/chat-rooms.schema";
export declare class FeedSyncStreamConsumer implements OnModuleInit, OnModuleDestroy {
    private readonly redis;
    private readonly config;
    private readonly connection;
    private readonly feedSyncModel;
    private readonly chatRoomModel;
    private readonly logger;
    private running;
    private loopChain;
    constructor(redis: Redis, config: ConfigService, connection: Connection, feedSyncModel: Model<FeedSyncDocument>, chatRoomModel: Model<ChatRoomDocument>);
    processMessageWithAck(streamKey: string, group: string, messageId: string, fields: Record<string, string>): Promise<void>;
    onModuleInit(): void;
    onModuleDestroy(): Promise<void>;
    private runLoop;
    private ensureConsumerGroup;
    private handleFields;
    private updateChatRoomByUpdatedFeed;
    private upsertFeedSync;
}
