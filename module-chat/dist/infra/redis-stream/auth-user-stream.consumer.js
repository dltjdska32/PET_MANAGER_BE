"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AuthUserStreamConsumer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthUserStreamConsumer = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const ioredis_1 = __importDefault(require("ioredis"));
const mongoose_2 = require("mongoose");
const chat_user_schema_1 = require("../../model/chat-user.schema");
const redis_stream_tokens_1 = require("./redis-stream.tokens");
const stream_fields_util_1 = require("./stream-fields.util");
const chat_user_embedded_sync_repo_1 = require("../../model/repo/chat-user-embedded-sync.repo");
const EventType = {
    USER_CREATED: 'USER_CREATED',
    USER_NICKNAME_UPDATED: 'USER_NICKNAME_UPDATED',
    USER_REGIONS_UPSERTED: 'USER_REGIONS_UPSERTED',
    USER_REGION_DELETED: 'USER_REGION_DELETED',
    USER_PROFILE_IMG_UPDATED: 'USER_PROFILE_IMG_UPDATED',
};
let AuthUserStreamConsumer = AuthUserStreamConsumer_1 = class AuthUserStreamConsumer {
    redis;
    config;
    connection;
    chatUserModel;
    chatUserEmbeddedSyncRepo;
    logger = new common_1.Logger(AuthUserStreamConsumer_1.name);
    running = false;
    loopChain;
    constructor(redis, config, connection, chatUserModel, chatUserEmbeddedSyncRepo) {
        this.redis = redis;
        this.config = config;
        this.connection = connection;
        this.chatUserModel = chatUserModel;
        this.chatUserEmbeddedSyncRepo = chatUserEmbeddedSyncRepo;
    }
    async processMessageWithAck(streamKey, group, messageId, fields) {
        await this.handleFields(fields);
        await this.redis.xack(streamKey, group, messageId);
    }
    onModuleInit() {
        const map = this.config.getOrThrow('redisStream');
        const cfg = map.streams.auth;
        if (!cfg.enabled) {
            this.logger.log('Redis stream consumer disabled (REDIS_STREAM_ENABLED=false)');
            return;
        }
        this.running = true;
        this.loopChain = this.runLoop(cfg).catch((err) => {
            this.logger.error(`Redis stream loop terminated: ${err instanceof Error ? err.message : String(err)}`);
        });
    }
    async onModuleDestroy() {
        this.running = false;
        await this.loopChain?.catch(() => undefined);
        await this.redis.quit().catch(() => undefined);
    }
    async runLoop(cfg) {
        await this.ensureConsumerGroup(cfg.streamKey, cfg.group);
        while (this.running) {
            let reply;
            try {
                reply = (await this.redis.xreadgroup('GROUP', cfg.group, cfg.consumerName, 'COUNT', cfg.count, 'BLOCK', cfg.blockMs, 'STREAMS', cfg.streamKey, '>'));
            }
            catch (err) {
                this.logger.warn(`XREADGROUP error: ${err instanceof Error ? err.message : String(err)}`);
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
                    const fields = (0, stream_fields_util_1.fieldsToRecord)(fieldsArr);
                    try {
                        await this.handleFields(fields);
                        await this.redis.xack(cfg.streamKey, cfg.group, id);
                    }
                    catch (err) {
                        this.logger.error(`Failed id=${id}: ${err instanceof Error ? err.message : String(err)}`);
                    }
                }
            }
        }
    }
    async ensureConsumerGroup(streamKey, group) {
        try {
            await this.redis.xgroup('CREATE', streamKey, group, '0', 'MKSTREAM');
            this.logger.log(`Created consumer group "${group}" on "${streamKey}"`);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.includes('BUSYGROUP')) {
                return;
            }
            this.logger.error(`Failed to create consumer group "${group}" on "${streamKey}": ${msg}`);
        }
    }
    async handleFields(fields) {
        const getEventType = fields.eventType;
        const getEventValue = fields.value;
        if (!getEventValue || !getEventType) {
            throw new Error('이벤트 타입 또는 값 확인 불가');
        }
        switch (getEventType) {
            case EventType.USER_CREATED:
                await this.handleUserCreatedEvent(JSON.parse(getEventValue));
                break;
            case EventType.USER_REGIONS_UPSERTED:
                await this.handleUserRegionUpsertedEvent(JSON.parse(getEventValue));
                break;
            case EventType.USER_NICKNAME_UPDATED:
                await this.handleUserNicknameUpdatedEvent(JSON.parse(getEventValue));
                break;
            case EventType.USER_REGION_DELETED:
                await this.handleUserRegionDeletedEvent(JSON.parse(getEventValue));
                break;
            case EventType.USER_PROFILE_IMG_UPDATED:
                await this.handleUserProfileImgUpdatedEvent(JSON.parse(getEventValue));
                break;
            default:
                this.logger.error(`확인할 수 없는 이벤트 타입: ${getEventType}`);
        }
    }
    handleUserCreatedEvent(val) {
        return this.connection.transaction(async (session) => {
            const username = val.username ?? `user_${val.userId}`;
            await this.chatUserModel.updateOne({ userId: val.userId }, {
                $set: {
                    username,
                    userEmail: val.email,
                    userNickname: val.nickname,
                    userRole: val.role ?? 'ROLE_USER',
                    userMainImgUrl: val.userMainImgUrl ?? null,
                    userRegionIds: val.regionIds,
                    isDeleted: false,
                },
            }, { upsert: true, session });
        });
    }
    handleUserRegionUpsertedEvent(val) {
        return this.connection.transaction(async (session) => {
            await this.chatUserModel.updateOne({ userId: val.userId }, {
                $set: {
                    userRegionIds: val.userRegionIds,
                },
            }, { upsert: true, session });
        });
    }
    handleUserNicknameUpdatedEvent(val) {
        return this.connection.transaction(async (session) => {
            await this.chatUserModel.updateOne({ userId: val.userId }, {
                $set: {
                    userNickname: val.nickname,
                },
            }, { upsert: true, session });
            await this.syncEmbeddedUserProfile(val.userId, { userNickname: val.nickname }, session);
        });
    }
    handleUserRegionDeletedEvent(val) {
        return this.connection.transaction(async (session) => {
            await this.chatUserModel.updateOne({ userId: val.userId }, {
                $pull: {
                    userRegionIds: { $in: val.deletedRegionIds },
                },
            }, { session });
        });
    }
    handleUserProfileImgUpdatedEvent(val) {
        return this.connection.transaction(async (session) => {
            await this.chatUserModel.updateOne({ userId: val.userId }, {
                $set: {
                    userMainImgUrl: val.userMainImgUrl,
                },
            }, { upsert: true, session });
        });
    }
    syncEmbeddedUserProfile(userId, patch, session) {
        return this.chatUserEmbeddedSyncRepo.syncEmbeddedUserProfile(userId, patch, session);
    }
};
exports.AuthUserStreamConsumer = AuthUserStreamConsumer;
exports.AuthUserStreamConsumer = AuthUserStreamConsumer = AuthUserStreamConsumer_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(redis_stream_tokens_1.REDIS_STREAM_CLIENT)),
    __param(2, (0, mongoose_1.InjectConnection)()),
    __param(3, (0, mongoose_1.InjectModel)(chat_user_schema_1.ChatUser.name)),
    __metadata("design:paramtypes", [ioredis_1.default,
        config_1.ConfigService,
        mongoose_2.Connection,
        mongoose_2.Model,
        chat_user_embedded_sync_repo_1.ChatUserEmbeddedSyncRepo])
], AuthUserStreamConsumer);
//# sourceMappingURL=auth-user-stream.consumer.js.map