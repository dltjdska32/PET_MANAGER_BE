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
var ChatController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const api_response_1 = require("../config/api-response");
const current_user_decorator_1 = require("../config/auth/current-user.decorator");
const find_chat_logs_req_dto_1 = require("../dtos/find-chat-logs.req.dto");
const chat_service_1 = require("../service/chat.service");
const join_chat_room_req_dto_1 = require("../dtos/join-chat-room.req.dto");
const find_chat_rooms_req_dto_1 = require("../dtos/find-chat-rooms.req.dto");
const send_message_req_dto_1 = require("../dtos/send-message.req.dto");
const multer_1 = require("@nestjs/platform-express/multer");
const chat_exception_1 = require("../config/exception/chat.exception");
const chat_logs_schema_1 = require("../model/chat-logs.schema");
let ChatController = ChatController_1 = class ChatController {
    chatService;
    constructor(chatService) {
        this.chatService = chatService;
    }
    logger = new common_1.Logger(ChatController_1.name);
    async getChatLogs(user, req) {
        this.logger.log('[getChatLogs] getChatLogs 호출 user: ', user.userId, ' roomId: ', req.roomId);
        const value = await this.chatService.findChatLogs(user, req);
        return api_response_1.ApiResponse.pagination(value);
    }
    async joinChatRoom(user, req) {
        this.logger.log('[joinChatRoom] req: ', req);
        const value = await this.chatService.createOrGetChatRoom(user, req);
        return api_response_1.ApiResponse.ok(value);
    }
    async getChatRooms(user, req) {
        return api_response_1.ApiResponse.pagination(await this.chatService.findChatRooms(user, req));
    }
    async uploadFile(user, req, files) {
        if (req.messageType !== chat_logs_schema_1.MessageType.FILE) {
            throw chat_exception_1.ChatException.badRequest('파일 업로드 API입니다.');
        }
        await this.chatService.sendMessage(user, req, files);
        return api_response_1.ApiResponse.ok();
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Get)('logs'),
    __param(0, (0, current_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true, whitelist: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, find_chat_logs_req_dto_1.FindChatLogsReqDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getChatLogs", null);
__decorate([
    (0, common_1.Post)('/join'),
    __param(0, (0, current_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, join_chat_room_req_dto_1.JoinChatRoomReqDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "joinChatRoom", null);
__decorate([
    (0, common_1.Get)("/rooms"),
    __param(0, (0, current_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true, whitelist: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, find_chat_rooms_req_dto_1.FindChatRoomsReqDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getChatRooms", null);
__decorate([
    (0, common_1.Post)("/files/upload"),
    (0, common_1.UseInterceptors)((0, multer_1.FilesInterceptor)('files', 10)),
    __param(0, (0, current_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe({ transform: true, whitelist: true }))),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, send_message_req_dto_1.SendMessageReqDto, Array]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "uploadFile", null);
exports.ChatController = ChatController = ChatController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map