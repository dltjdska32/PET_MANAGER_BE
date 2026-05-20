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
var ChatGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const jsonwebtoken_1 = require("jsonwebtoken");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const ws_exception_filter_1 = require("../config/exception/ws-exception.filter");
const chat_service_1 = require("../service/chat.service");
const chat_exception_1 = require("../config/exception/chat.exception");
const base_exception_1 = require("../config/exception/base.exception");
const api_response_1 = require("../config/api-response");
const chat_user_service_1 = require("../service/chat-user.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const send_message_req_dto_1 = require("../dtos/send-message.req.dto");
const chat_logs_schema_1 = require("../model/chat-logs.schema");
const chat_message_created_event_dto_1 = require("../dtos/chat_message_created.event.dto");
const ws_read_message_dto_1 = require("../dtos/ws-read-message.dto");
const leave_chat_room_req_dto_1 = require("../dtos/leave-chat-room.req.dto");
function toChatSession(decoded) {
    return {
        userId: String(decoded.sub),
        userName: decoded.userName,
        userEmail: decoded.userEmail,
        userRole: decoded.userRole,
        exp: decoded.exp,
    };
}
let ChatGateway = ChatGateway_1 = class ChatGateway {
    jwtService;
    chatService;
    chatUserService;
    logger = new common_1.Logger(ChatGateway_1.name);
    wsValidationPipe = new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
    });
    server;
    constructor(jwtService, chatService, chatUserService) {
        this.jwtService = jwtService;
        this.chatService = chatService;
        this.chatUserService = chatUserService;
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token ??
                client.handshake.headers.authorization?.replace(/^Bearer\s+/i, '');
            if (!token) {
                throw new chat_exception_1.ChatException(common_1.HttpStatus.UNAUTHORIZED, 'CHAT_ERR_03', 'UNAUTHORIZED');
            }
            const decoded = await this.jwtService.verifyAsync(token);
            if (decoded.sub === undefined || decoded.sub === null) {
                throw new chat_exception_1.ChatException(common_1.HttpStatus.UNAUTHORIZED, 'CHAT_ERR_03', 'UNAUTHORIZED');
            }
            const session = toChatSession(decoded);
            const sockData = client.data;
            sockData.session = session;
            console.log('WS ?? ??: userId = ', session.userId, ' clientId = ', client.id);
        }
        catch (err) {
            const payload = this.toConnectErrorPayload(err);
            client.emit(ws_exception_filter_1.WS_EXCEPTION_EVENT, payload);
            client.disconnect(true);
        }
    }
    handleDisconnect(client) {
        const sockData = client.data;
        if (sockData.session) {
            console.log('?? ?? ??: userId = ', sockData.session.userId, ' clientId = ', client.id);
            delete sockData.session;
        }
        console.log('?? ?? ??: clientId = ', client.id);
    }
    async handleSendMessage(body, client) {
        await this.runWsSafe(client, async () => {
            const dto = (await this.wsValidationPipe.transform(body, {
                type: 'body',
                metatype: send_message_req_dto_1.SendMessageReqDto,
            }));
            if (dto.messageType !== chat_logs_schema_1.MessageType.TEXT) {
                throw chat_exception_1.ChatException.badRequest('INVALID_MESSAGE_TYPE');
            }
            const userInfo = this.requireSessionUser(client);
            await this.chatService.sendMessage(userInfo, dto);
            client.emit('send-message-success');
        });
    }
    async handleReadMessage(message, client) {
        await this.runWsSafe(client, async () => {
            const userId = this.requireSessionUserId(client);
            await this.chatService.readMessage(Number(userId), message);
            client.emit('read-message-success');
        });
    }
    async handleJoinRoom(roomId, client) {
        await this.runWsSafe(client, async () => {
            const userId = this.requireSessionUserId(client);
            await this.chatService.getValidatedChatRoom(Number(userId), roomId);
            await client.join(roomId);
            client.emit('join-room');
        });
    }
    async handleLeaveRoom(body, client) {
        await this.runWsSafe(client, async () => {
            const reqDto = (await this.wsValidationPipe.transform(body, {
                type: 'body',
                metatype: leave_chat_room_req_dto_1.LeaveChatRoomReqDto,
            }));
            const basicUserInfo = this.requireSessionUser(client);
            const leftUserInfo = await this.chatService
                .leaveChatRoom(Number(basicUserInfo.userId), reqDto);
            client.to(leftUserInfo.roomId)
                .emit('member-left', { userId: basicUserInfo.userId,
                username: basicUserInfo.username });
            await client.leave(leftUserInfo.roomId);
            client.emit('leave-room-success', { roomId: leftUserInfo.roomId });
        });
    }
    handleChatMessageCreated(event) {
        try {
            this.logger.log(`[handleChatMessageCreated] roomId=${event.roomId} type=${event.payload.messageType} logid=${event.payload.logid}`);
            this.server
                .to(event.roomId)
                .emit('new-message', { ...event.payload });
        }
        catch (err) {
            this.logger.error(`new-message broadcast failed roomId=${event.roomId}`, err instanceof Error ? err.stack : String(err));
        }
    }
    async runWsSafe(client, handler) {
        try {
            await handler();
        }
        catch (err) {
            (0, ws_exception_filter_1.emitWsException)(client, err, this.logger);
        }
    }
    requireSessionUserId(client) {
        const sockData = client.data;
        const userId = sockData.session?.userId;
        if (userId === undefined || userId === null) {
            throw new chat_exception_1.ChatException(common_1.HttpStatus.UNAUTHORIZED, 'CHAT_ERR_03', 'UNAUTHORIZED');
        }
        return userId;
    }
    requireSessionUser(client) {
        const sockData = client.data;
        const session = sockData.session;
        if (!session) {
            throw new chat_exception_1.ChatException(common_1.HttpStatus.UNAUTHORIZED, 'CHAT_ERR_03', 'UNAUTHORIZED');
        }
        return {
            userId: session.userId,
            username: session.userName ?? '',
            email: session.userEmail ?? '',
            role: session.userRole ?? '',
            accessTokenExpiresAt: session.exp ?? 0,
        };
    }
    toConnectErrorPayload(err) {
        if (err instanceof base_exception_1.BaseException) {
            return api_response_1.ApiResponse.error(err.statusCode, err.code, err.message);
        }
        if (err instanceof jsonwebtoken_1.TokenExpiredError) {
            return api_response_1.ApiResponse.error(common_1.HttpStatus.UNAUTHORIZED, 'CHAT_JWT_EXPIRED', '??? ??? ???????.');
        }
        if (err instanceof jsonwebtoken_1.NotBeforeError) {
            return api_response_1.ApiResponse.error(common_1.HttpStatus.UNAUTHORIZED, 'CHAT_JWT_NOT_ACTIVE', '?? ???? ?? ?????.');
        }
        if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
            return api_response_1.ApiResponse.error(common_1.HttpStatus.UNAUTHORIZED, 'CHAT_JWT_INVALID', '?? ??? ???? ????.');
        }
        return api_response_1.ApiResponse.error(common_1.HttpStatus.INTERNAL_SERVER_ERROR, 'INTERNAL_SERVER_ERR', '?? ?? ? ??? ??????.');
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('send-message'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('read-message'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ws_read_message_dto_1.WsReadMessageDto,
        socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleReadMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-room'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave-room'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleLeaveRoom", null);
__decorate([
    (0, event_emitter_1.OnEvent)(chat_message_created_event_dto_1.CHAT_MESSAGE_CREATED, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chat_message_created_event_dto_1.ChatMessageCreatedEvent]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleChatMessageCreated", null);
exports.ChatGateway = ChatGateway = ChatGateway_1 = __decorate([
    (0, common_1.UseFilters)(ws_exception_filter_1.WsExceptionFilter),
    (0, websockets_1.WebSocketGateway)({
        namespace: '/chat',
        cors: {
            origin: '*',
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        chat_service_1.ChatService,
        chat_user_service_1.ChatUserService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map