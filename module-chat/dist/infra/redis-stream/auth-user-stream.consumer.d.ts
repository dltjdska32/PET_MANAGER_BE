import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Connection, Model } from 'mongoose';
import { ChatUserDocument } from '../../model/chat-user.schema';
import { ChatUserEmbeddedSyncRepo } from '../../model/repo/chat-user-embedded-sync.repo';
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
export declare class AuthUserStreamConsumer implements OnModuleInit, OnModuleDestroy {
    private readonly redis;
    private readonly config;
    private readonly connection;
    private readonly chatUserModel;
    private readonly chatUserEmbeddedSyncRepo;
    private readonly logger;
    private running;
    private loopChain;
    constructor(redis: Redis, config: ConfigService, connection: Connection, chatUserModel: Model<ChatUserDocument>, chatUserEmbeddedSyncRepo: ChatUserEmbeddedSyncRepo);
    processMessageWithAck(streamKey: string, group: string, messageId: string, fields: Record<string, string>): Promise<void>;
    onModuleInit(): void;
    onModuleDestroy(): Promise<void>;
    private runLoop;
    private ensureConsumerGroup;
    private handleFields;
    private handleUserCreatedEvent;
    private handleUserRegionUpsertedEvent;
    private handleUserNicknameUpdatedEvent;
    private handleUserRegionDeletedEvent;
    private handleUserProfileImgUpdatedEvent;
    private syncEmbeddedUserProfile;
}
