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
var FeedSyncStreamConsumer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedSyncStreamConsumer = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const ioredis_1 = __importDefault(require("ioredis"));
const mongoose_2 = require("mongoose");
const feed_sync_schema_1 = require("../../model/feed-sync.schema");
const feed_snapshot_util_1 = require("../../model/feed-snapshot.util");
const redis_stream_tokens_1 = require("./redis-stream.tokens");
const stream_fields_util_1 = require("./stream-fields.util");
const chat_rooms_schema_1 = require("../../model/chat-rooms.schema");
const FeedStreamEventType = {
    CREATED_FEED: 'CREATED_FEED',
    UPDATED_FEED: 'UPDATED_FEED',
    DELETED_FEED: 'DELETED_FEED',
};
let FeedSyncStreamConsumer = FeedSyncStreamConsumer_1 = class FeedSyncStreamConsumer {
    redis;
    config;
    connection;
    feedSyncModel;
    chatRoomModel;
    logger = new common_1.Logger(FeedSyncStreamConsumer_1.name);
    running = false;
    loopChain;
    constructor(redis, config, connection, feedSyncModel, chatRoomModel) {
        this.redis = redis;
        this.config = config;
        this.connection = connection;
        this.feedSyncModel = feedSyncModel;
        this.chatRoomModel = chatRoomModel;
    }
    async processMessageWithAck(streamKey, group, messageId, fields) {
        await this.handleFields(fields);
        await this.redis.xack(streamKey, group, messageId);
    }
    onModuleInit() {
        const map = this.config.getOrThrow('redisStream');
        const cfg = map.streams.feedSync;
        if (!cfg.enabled) {
            this.logger.log('Feed sync Redis stream consumer off (REDIS_FEED_STREAM_ENABLED=false)');
            return;
        }
        this.running = true;
        this.loopChain = this.runLoop(cfg).catch((err) => {
            this.logger.error(`Feed sync stream loop terminated: ${err instanceof Error ? err.message : String(err)}`);
        });
    }
    async onModuleDestroy() {
        this.running = false;
        await this.loopChain?.catch(() => undefined);
    }
    async runLoop(cfg) {
        await this.ensureConsumerGroup(cfg.streamKey, cfg.group);
        while (this.running) {
            let reply;
            try {
                reply = (await this.redis.xreadgroup('GROUP', cfg.group, cfg.consumerName, 'COUNT', cfg.count, 'BLOCK', cfg.blockMs, 'STREAMS', cfg.streamKey, '>'));
            }
            catch (err) {
                this.logger.warn(`Feed sync XREADGROUP error: ${err instanceof Error ? err.message : String(err)}`);
                continue;
            }
            if (!reply) {
                continue;
            }
            for (const [, messages] of reply) {
                if (!messages)
                    continue;
                for (const [id, fieldsArr] of messages) {
                    const fields = (0, stream_fields_util_1.fieldsToRecord)(fieldsArr);
                    try {
                        await this.handleFields(fields);
                        await this.redis.xack(cfg.streamKey, cfg.group, id);
                    }
                    catch (err) {
                        this.logger.error(`Feed sync failed id=${id}: ${err instanceof Error ? err.message : String(err)}`);
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
        const eventType = fields.eventType;
        const raw = fields.value;
        if (!raw || !eventType) {
            throw new Error('feed-chat 이벤트 타입 또는 값 없음');
        }
        const payload = JSON.parse(raw);
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
    async updateChatRoomByUpdatedFeed(payload) {
        await this.connection.transaction(async (session) => {
            await this.chatRoomModel.updateMany({ 'feedInfo.feedId': payload.id, isDeleted: false }, {
                $set: {
                    ...(0, feed_snapshot_util_1.buildChatRoomFeedInfoSet)(payload),
                    updatedAt: new Date(),
                },
            }, { session });
        });
    }
    async upsertFeedSync(payload) {
        await this.connection.transaction(async (session) => {
            await this.feedSyncModel.updateOne({ feedId: payload.id }, {
                $set: (0, feed_snapshot_util_1.buildFeedSyncDocumentSet)(payload),
            }, { upsert: true, session });
        });
    }
};
exports.FeedSyncStreamConsumer = FeedSyncStreamConsumer;
exports.FeedSyncStreamConsumer = FeedSyncStreamConsumer = FeedSyncStreamConsumer_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(redis_stream_tokens_1.REDIS_STREAM_CLIENT)),
    __param(2, (0, mongoose_1.InjectConnection)()),
    __param(3, (0, mongoose_1.InjectModel)(feed_sync_schema_1.FeedSync.name)),
    __param(4, (0, mongoose_1.InjectModel)(chat_rooms_schema_1.ChatRoom.name)),
    __metadata("design:paramtypes", [ioredis_1.default,
        config_1.ConfigService,
        mongoose_2.Connection,
        mongoose_2.Model,
        mongoose_2.Model])
], FeedSyncStreamConsumer);
//# sourceMappingURL=feed-sync-stream.consumer.js.map