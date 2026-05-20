"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const mongoose_1 = require("@nestjs/mongoose");
const global_exception_filter_1 = require("./config/exception/global-exception.filter");
const redis_stream_config_1 = __importDefault(require("./infra/redis-stream/redis-stream.config"));
const chat_gateway_1 = require("./controller/chat.gateway");
const chat_user_schema_1 = require("./model/chat-user.schema");
const chat_rooms_schema_1 = require("./model/chat-rooms.schema");
const chat_logs_schema_1 = require("./model/chat-logs.schema");
const feed_sync_schema_1 = require("./model/feed-sync.schema");
const chat_controller_1 = require("./controller/chat.controller");
const auth_user_stream_consumer_1 = require("./infra/redis-stream/auth-user-stream.consumer");
const auth_user_stream_retry_scheduler_1 = require("./infra/redis-stream/auth-user-stream-retry.scheduler");
const feed_sync_stream_consumer_1 = require("./infra/redis-stream/feed-sync-stream.consumer");
const feed_sync_stream_retry_scheduler_1 = require("./infra/redis-stream/feed-sync-stream-retry.scheduler");
const redis_stream_providers_1 = require("./infra/redis-stream/redis-stream.providers");
const chat_service_1 = require("./service/chat.service");
const chat_rooms_repo_1 = require("./model/repo/chat-rooms.repo");
const chat_logs_repo_1 = require("./model/repo/chat-logs.repo");
const feed_sync_repo_1 = require("./model/repo/feed-sync.repo");
const s3_1 = require("./infra/s3");
const event_emitter_1 = require("@nestjs/event-emitter");
const jwt_1 = require("@nestjs/jwt");
const chat_user_service_1 = require("./service/chat-user.service");
const chat_user_repo_1 = require("./model/repo/chat-user.repo");
const chat_user_embedded_sync_repo_1 = require("./model/repo/chat-user-embedded-sync.repo");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
                load: [redis_stream_config_1.default, s3_1.s3Config],
            }),
            event_emitter_1.EventEmitterModule.forRoot(),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (config) => ({
                    uri: config.getOrThrow('MONGODB_URI'),
                }),
                inject: [config_1.ConfigService],
            }),
            jwt_1.JwtModule.registerAsync({
                global: true,
                imports: [config_1.ConfigModule],
                useFactory: (config) => ({
                    secret: config.getOrThrow('JWT_SECRET'),
                }),
                inject: [config_1.ConfigService],
            }),
            mongoose_1.MongooseModule.forFeature([
                { name: chat_user_schema_1.ChatUser.name, schema: chat_user_schema_1.ChatUserSchema },
                { name: chat_logs_schema_1.ChatLog.name, schema: chat_logs_schema_1.ChatLogSchema },
                { name: chat_rooms_schema_1.ChatRoom.name, schema: chat_rooms_schema_1.ChatRoomSchema },
                { name: feed_sync_schema_1.FeedSync.name, schema: feed_sync_schema_1.FeedSyncSchema },
            ]),
        ],
        controllers: [chat_controller_1.ChatController],
        providers: [
            { provide: core_1.APP_FILTER, useClass: global_exception_filter_1.GlobalExceptionFilter },
            redis_stream_providers_1.redisStreamClientProvider,
            auth_user_stream_consumer_1.AuthUserStreamConsumer,
            auth_user_stream_retry_scheduler_1.AuthUserStreamRetryScheduler,
            feed_sync_stream_consumer_1.FeedSyncStreamConsumer,
            feed_sync_stream_retry_scheduler_1.FeedSyncStreamRetryScheduler,
            chat_gateway_1.ChatGateway,
            chat_service_1.ChatService,
            chat_user_service_1.ChatUserService,
            chat_user_repo_1.ChatUserRepo,
            chat_user_embedded_sync_repo_1.ChatUserEmbeddedSyncRepo,
            chat_rooms_repo_1.ChatRoomsRepo,
            chat_logs_repo_1.ChatLogsRepo,
            feed_sync_repo_1.FeedSyncRepo,
            s3_1.s3ClientProvider,
            s3_1.S3StorageService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map