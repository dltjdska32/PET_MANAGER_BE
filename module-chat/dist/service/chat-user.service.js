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
var ChatUserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatUserService = void 0;
const mongoose_1 = require("mongoose");
const common_1 = require("@nestjs/common");
const mongoose_2 = require("@nestjs/mongoose");
const chat_user_repo_1 = require("../model/repo/chat-user.repo");
const ws_join_room_resp_dto_1 = require("../dtos/ws-join-room.resp.dto");
const chat_exception_1 = require("../config/exception/chat.exception");
let ChatUserService = ChatUserService_1 = class ChatUserService {
    chatUsersRepo;
    conn;
    logger = new common_1.Logger(ChatUserService_1.name);
    constructor(chatUsersRepo, conn) {
        this.chatUsersRepo = chatUsersRepo;
        this.conn = conn;
    }
    async findChatUserDocByUserId(userId) {
        const chatUserDoc = await this.chatUsersRepo.findChatUserDocumentByUserId(userId);
        if (!chatUserDoc) {
            throw new chat_exception_1.ChatException(common_1.HttpStatus.NOT_FOUND, 'CHAT_ERR_04', '채팅 유저를 찾을 수 없습니다.');
        }
        return new ws_join_room_resp_dto_1.WsJoinRoomRespDto(Number(chatUserDoc.userId), chatUserDoc.username, chatUserDoc.userNickname);
    }
};
exports.ChatUserService = ChatUserService;
exports.ChatUserService = ChatUserService = ChatUserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(chat_user_repo_1.ChatUserRepo)),
    __param(1, (0, mongoose_2.InjectConnection)()),
    __metadata("design:paramtypes", [chat_user_repo_1.ChatUserRepo,
        mongoose_1.Connection])
], ChatUserService);
//# sourceMappingURL=chat-user.service.js.map