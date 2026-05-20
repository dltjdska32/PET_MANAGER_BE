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
exports.ChatLogsRepo = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const chat_logs_schema_1 = require("../chat-logs.schema");
const find_chat_logs_resp_dto_1 = require("../../dtos/find-chat-logs.resp.dto");
const chat_user_info_dto_1 = require("../../dtos/chat-user-info.dto");
const slice_1 = require("../../config/slice");
const chat_exception_1 = require("../../config/exception/chat.exception");
let ChatLogsRepo = class ChatLogsRepo {
    model;
    constructor(model) {
        this.model = model;
    }
    async getFindChatLogsRespDtoSlice(user, dto, session) {
        void user;
        const filter = {
            roomId: dto.roomId,
            isDeleted: false,
        };
        if (dto.lastCreatedAt != null && dto.lastId != null) {
            const lastCreatedAt = new Date(dto.lastCreatedAt);
            const lastId = new mongoose_2.Types.ObjectId(dto.lastId);
            filter.$or = [
                { createdAt: { $lt: lastCreatedAt } },
                { createdAt: { $eq: lastCreatedAt }, _id: { $lt: lastId } },
            ];
        }
        let q = this.model
            .find(filter)
            .sort({ createdAt: -1, _id: -1 })
            .limit(dto.size + 1);
        if (session) {
            q = q.session(session);
        }
        const chatLogs = await q.exec();
        const hasNext = chatLogs.length > dto.size;
        const slicedChatLogs = hasNext ? chatLogs.slice(0, dto.size) : chatLogs;
        const toChatUserInfoDto = (u) => new chat_user_info_dto_1.ChatUserInfo(u.userId, u.username, u.userNickname, u.userEmail);
        const nextCursor = hasNext && slicedChatLogs.length > 0
            ? new slice_1.NextCursor(slicedChatLogs[slicedChatLogs.length - 1]._id.toString(), new Date(slicedChatLogs[slicedChatLogs.length - 1].createdAt))
            : null;
        const respDtos = slicedChatLogs.map((cl) => new find_chat_logs_resp_dto_1.FindChatLogsRespDto(cl.roomId, cl._id.toString(), new Date(cl.createdAt), toChatUserInfoDto(cl.sender), (cl.readUserIds ?? []).map((u) => u.userId), cl.messageType, cl.message, cl.file));
        return new slice_1.Slice(respDtos, hasNext, nextCursor);
    }
    async findLatestLogIdByRoomId(roomId, session) {
        let q = this.model
            .findOne({ roomId, isDeleted: false })
            .sort({ _id: -1 })
            .select('_id');
        if (session) {
            q = q.session(session);
        }
        const latestLog = await q.exec();
        return latestLog?._id.toString() ?? null;
    }
    async markChatLogsAsReadUpTo(roomId, reader, lastMessageId, session) {
        if (!mongoose_2.Types.ObjectId.isValid(lastMessageId)) {
            throw chat_exception_1.ChatException.badRequest('메시지 ID가 올바르지 않습니다.');
        }
        const result = await this.model.updateMany({
            roomId,
            isDeleted: false,
            _id: { $lte: new mongoose_2.Types.ObjectId(lastMessageId) },
            'readUserIds.userId': { $ne: Number(reader.userId) },
        }, {
            $push: { readUserIds: reader },
        }, { session });
        return result.modifiedCount;
    }
    async createTextChatLog(roomId, sender, messageType, message, session) {
        const [doc] = await this.model.create([
            {
                roomId,
                messageType,
                message: message ?? undefined,
                sender,
                readUserIds: [sender],
                isDeleted: false,
            },
        ], { session });
        return doc;
    }
    async createFileChatLog(sender, req, files, session) {
        const [doc] = await this.model.create([
            {
                roomId: req.roomId,
                messageType: chat_logs_schema_1.MessageType.FILE,
                sender,
                readUserIds: [sender],
                file: files,
                isDeleted: false,
            },
        ], { session });
        return doc;
    }
};
exports.ChatLogsRepo = ChatLogsRepo;
exports.ChatLogsRepo = ChatLogsRepo = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(chat_logs_schema_1.ChatLog.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ChatLogsRepo);
//# sourceMappingURL=chat-logs.repo.js.map