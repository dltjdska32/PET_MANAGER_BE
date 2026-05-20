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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatUserEmbeddedSyncRepo = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const chat_logs_schema_1 = require("../chat-logs.schema");
const chat_rooms_schema_1 = require("../chat-rooms.schema");
const feed_sync_schema_1 = require("../feed-sync.schema");
let ChatUserEmbeddedSyncRepo = class ChatUserEmbeddedSyncRepo {
    chatRoomModel;
    chatLogModel;
    feedSyncModel;
    constructor(chatRoomModel, chatLogModel, feedSyncModel) {
        this.chatRoomModel = chatRoomModel;
        this.chatLogModel = chatLogModel;
        this.feedSyncModel = feedSyncModel;
    }
    async syncEmbeddedUserProfile(userId, patch, session) {
        if (patch.username === undefined &&
            patch.userNickname === undefined &&
            patch.userEmail === undefined) {
            return;
        }
        await Promise.all([
            this.syncChatRoomMembers(userId, patch, session),
            this.syncChatRoomFeedAuthor(userId, patch, session),
            this.syncFeedSyncAuthor(userId, patch, session),
            this.syncChatLogSender(userId, patch, session),
            this.syncChatLogReaders(userId, patch, session),
        ]);
    }
    async syncChatRoomMembers(userId, patch, session) {
        const $set = this.buildArrayPathSet('chatMembers', 'member', patch);
        if (Object.keys($set).length === 0) {
            return;
        }
        await this.chatRoomModel.updateMany({ isDeleted: false, 'chatMembers.userId': userId }, { $set }, {
            arrayFilters: [{ 'member.userId': userId }],
            session: session ?? undefined,
        });
    }
    async syncChatRoomFeedAuthor(userId, patch, session) {
        const $set = {};
        if (patch.userNickname !== undefined) {
            $set['feedInfo.authorNickname'] = patch.userNickname;
        }
        if (patch.username !== undefined) {
            $set['feedInfo.authorUsername'] = patch.username;
        }
        if (Object.keys($set).length === 0) {
            return;
        }
        await this.chatRoomModel.updateMany({ isDeleted: false, 'feedInfo.authorId': userId }, { $set }, { session: session ?? undefined });
    }
    async syncFeedSyncAuthor(userId, patch, session) {
        const $set = {};
        if (patch.userNickname !== undefined) {
            $set.authorNickname = patch.userNickname;
        }
        if (patch.username !== undefined) {
            $set.username = patch.username;
        }
        if (Object.keys($set).length === 0) {
            return;
        }
        await this.feedSyncModel.updateMany({ isDeleted: false, authorId: String(userId) }, { $set }, { session: session ?? undefined });
    }
    async syncChatLogSender(userId, patch, session) {
        const $set = this.buildObjectFieldSet('sender', patch);
        if (Object.keys($set).length === 0) {
            return;
        }
        await this.chatLogModel.updateMany({ isDeleted: false, 'sender.userId': userId }, { $set }, { session: session ?? undefined });
    }
    async syncChatLogReaders(userId, patch, session) {
        const $set = this.buildArrayPathSet('readUserIds', 'reader', patch);
        if (Object.keys($set).length === 0) {
            return;
        }
        await this.chatLogModel.updateMany({ isDeleted: false, 'readUserIds.userId': userId }, { $set }, {
            arrayFilters: [{ 'reader.userId': userId }],
            session: session ?? undefined,
        });
    }
    buildArrayPathSet(arrayPath, elemAlias, patch) {
        const $set = {};
        if (patch.username !== undefined) {
            $set[`${arrayPath}.$[${elemAlias}].username`] = patch.username;
        }
        if (patch.userNickname !== undefined) {
            $set[`${arrayPath}.$[${elemAlias}].userNickname`] = patch.userNickname;
        }
        if (patch.userEmail !== undefined) {
            $set[`${arrayPath}.$[${elemAlias}].userEmail`] = patch.userEmail;
        }
        return $set;
    }
    buildObjectFieldSet(prefix, patch) {
        const $set = {};
        if (patch.username !== undefined) {
            $set[`${prefix}.username`] = patch.username;
        }
        if (patch.userNickname !== undefined) {
            $set[`${prefix}.userNickname`] = patch.userNickname;
        }
        if (patch.userEmail !== undefined) {
            $set[`${prefix}.userEmail`] = patch.userEmail;
        }
        return $set;
    }
};
exports.ChatUserEmbeddedSyncRepo = ChatUserEmbeddedSyncRepo;
exports.ChatUserEmbeddedSyncRepo = ChatUserEmbeddedSyncRepo = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(chat_rooms_schema_1.ChatRoom.name)),
    __param(1, (0, mongoose_1.InjectModel)(chat_logs_schema_1.ChatLog.name)),
    __param(2, (0, mongoose_1.InjectModel)(feed_sync_schema_1.FeedSync.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], ChatUserEmbeddedSyncRepo);
//# sourceMappingURL=chat-user-embedded-sync.repo.js.map