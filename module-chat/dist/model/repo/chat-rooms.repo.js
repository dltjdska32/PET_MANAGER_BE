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
exports.ChatRoomsRepo = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const chat_rooms_schema_1 = require("../chat-rooms.schema");
const slice_1 = require("../../config/slice");
const find_chat_rooms_resp_dto_1 = require("../../dtos/find-chat-rooms.resp.dto");
const feed_snapshot_util_1 = require("../feed-snapshot.util");
let ChatRoomsRepo = class ChatRoomsRepo {
    model;
    constructor(model) {
        this.model = model;
    }
    async getChatRoomDocumentById(roomId, session) {
        if (!mongoose_2.Types.ObjectId.isValid(roomId)) {
            return null;
        }
        const query = this.model.findById(new mongoose_2.Types.ObjectId(roomId)).where('isDeleted').equals(false);
        if (session) {
            query.session(session);
        }
        return query.exec();
    }
    async getChatRoomDocumentByFeedIdAndUserId(feedId, userId, session) {
        const query = this.model.findOne({
            isDeleted: false,
            'feedInfo.feedId': feedId,
            chatMembers: { $elemMatch: { userId } },
        });
        if (session) {
            query.session(session);
        }
        return query.exec();
    }
    async createChatRoomDocument(creatorInfo, authorInfo, dto, feedSync, session) {
        const [doc] = await this.model.create([
            {
                feedInfo: (0, feed_snapshot_util_1.buildFeedInfoFromFeedSync)(feedSync),
                creatorId: Number(creatorInfo.userId),
                chatMembers: [creatorInfo, authorInfo],
                chatRoomName: dto.chatRoomName,
            },
        ], session ? { session } : {});
        return doc;
    }
    async getFindChatRoomsRespDtoSlice(user, req, session) {
        const query = {
            isDeleted: false,
            chatMembers: { $elemMatch: { userId: Number(user.userId) } },
        };
        if (req.lastUpdatedAt != null && req.lastRoomId != null) {
            query.$or = [
                { updatedAt: { $lt: req.lastUpdatedAt } },
                { updatedAt: { $eq: req.lastUpdatedAt }, _id: { $lt: new mongoose_2.Types.ObjectId(req.lastRoomId) } },
            ];
        }
        const q = this.model
            .find(query)
            .sort({ updatedAt: -1 })
            .limit(req.size + 1);
        if (session) {
            q.session(session);
        }
        const chatRooms = await q.exec();
        const hasNext = chatRooms.length > req.size;
        const slicedChatRooms = hasNext ? chatRooms.slice(0, req.size) : chatRooms;
        const nextCursor = hasNext && slicedChatRooms.length > 0 ?
            new slice_1.NextCursor(slicedChatRooms[slicedChatRooms.length - 1]._id.toString(), new Date(slicedChatRooms[slicedChatRooms.length - 1].updatedAt)) : null;
        const respDtos = slicedChatRooms.map((r) => new find_chat_rooms_resp_dto_1.FindChatRoomsRespDto(r._id.toString(), r.feedInfo.feedId, r.feedInfo.mainImgUrl?.[0] ?? null, r.feedInfo.title, r.feedInfo.authorId, r.feedInfo.authorNickname, r.lastMessage ?? null, r.lastMessageId ?? null, r.lastMessageCreatedAt ?? null, new Date(r.createdAt), r.chatRoomName));
        return new slice_1.Slice(respDtos, hasNext, nextCursor);
    }
};
exports.ChatRoomsRepo = ChatRoomsRepo;
exports.ChatRoomsRepo = ChatRoomsRepo = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(chat_rooms_schema_1.ChatRoom.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ChatRoomsRepo);
//# sourceMappingURL=chat-rooms.repo.js.map