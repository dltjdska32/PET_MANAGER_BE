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
var ChatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const find_chat_logs_req_dto_1 = require("../dtos/find-chat-logs.req.dto");
const join_chat_room_resp_dto_1 = require("../dtos/join-chat-room.resp.dto");
const chat_exception_1 = require("../config/exception/chat.exception");
const chat_logs_repo_1 = require("../model/repo/chat-logs.repo");
const chat_rooms_repo_1 = require("../model/repo/chat-rooms.repo");
const feed_sync_repo_1 = require("../model/repo/feed-sync.repo");
const mongoose_1 = require("mongoose");
const mongoose_2 = require("@nestjs/mongoose");
const chat_logs_schema_1 = require("../model/chat-logs.schema");
const chat_user_repo_1 = require("../model/repo/chat-user.repo");
const chat_user_info_dto_1 = require("../dtos/chat-user-info.dto");
const s3_1 = require("../infra/s3");
const send_message_resp_dto_1 = require("../dtos/send-message.resp.dto");
const event_emitter_1 = require("@nestjs/event-emitter");
const chat_message_created_event_dto_1 = require("../dtos/chat_message_created.event.dto");
const chat_room_left_resp_dto_1 = require("../dtos/chat-room-left.resp.dto");
let ChatService = ChatService_1 = class ChatService {
    chatRoomsRepo;
    chatLogsRepo;
    feedSyncRepo;
    chatUserRepo;
    eventEmitter;
    s3Storage;
    conn;
    logger = new common_1.Logger(ChatService_1.name);
    constructor(chatRoomsRepo, chatLogsRepo, feedSyncRepo, chatUserRepo, eventEmitter, s3Storage, conn) {
        this.chatRoomsRepo = chatRoomsRepo;
        this.chatLogsRepo = chatLogsRepo;
        this.feedSyncRepo = feedSyncRepo;
        this.chatUserRepo = chatUserRepo;
        this.eventEmitter = eventEmitter;
        this.s3Storage = s3Storage;
        this.conn = conn;
    }
    async readMessage(userId, message) {
        return await this.conn.transaction(async (session) => {
            const chatRoom = await this.getValidatedChatRoom(userId, message.roomId, null, session);
            const reader = this.resolveChatRoomReader(chatRoom, userId);
            await this.chatLogsRepo.markChatLogsAsReadUpTo(message.roomId, reader, message.lastMessageId, session);
        });
    }
    async findChatRooms(user, req) {
        return await this.chatRoomsRepo.getFindChatRoomsRespDtoSlice(user, req, null);
    }
    async findChatLogs(user, req, session) {
        this.logger.log('[findChatLogs] findChatLogs 호출 roomId: ', req.roomId);
        await this.getValidatedChatRoom(Number(user.userId), req.roomId, null, session);
        return await this.chatLogsRepo.getFindChatLogsRespDtoSlice(user, req, session);
    }
    async createOrGetChatRoom(user, dto) {
        return await this.conn.transaction(async (session) => {
            this.logger.log('[createOrGetChatRoom] dto: ', dto);
            this.logger.log('[createOrGetChatRoom] user: ', user);
            if (!dto.feedId) {
                throw chat_exception_1.ChatException.badRequest('피드 아이디를 확인할 수 없습니다.');
            }
            const feedSync = await this.feedSyncRepo.findFeedSyncDocumentByFeedId(dto.feedId, session);
            if (!feedSync) {
                throw chat_exception_1.ChatException.badRequest('피드 정보를 확인할 수 없습니다.');
            }
            if (dto.roomId) {
                return await this.getJoinChatRoomRespDto(user, dto, feedSync, session);
            }
            const existingChatRoom = await this.chatRoomsRepo.getChatRoomDocumentByFeedIdAndUserId(dto.feedId, Number(user.userId), session);
            if (existingChatRoom) {
                return await this.buildJoinChatRoomRespDto(user, existingChatRoom, session);
            }
            return await this.createChatRoomDocumentByJoinChatRoomReqDto(user, dto, feedSync, session);
        });
    }
    async leaveChatRoom(userId, req) {
        return await this.conn.transaction(async (session) => {
            const chatRoom = await this.getValidatedChatRoom(userId, req.roomId, null, session);
            const leftMember = chatRoom.chatMembers.find((member) => member.userId === userId);
            if (!leftMember) {
                throw chat_exception_1.ChatException.badRequest('채팅방 멤버 정보를 확인할 수 없습니다.');
            }
            chatRoom.chatMembers = chatRoom.chatMembers.filter((member) => member.userId !== userId);
            await chatRoom.save({ session });
            return new chat_room_left_resp_dto_1.ChatRoomLeftRespDto(req.roomId, leftMember.userNickname, leftMember.userId);
        });
    }
    async createChatRoomDocumentByJoinChatRoomReqDto(user, dto, feedSync, session) {
        const getFeedSync = await this.feedSyncRepo.findFeedSyncDocumentByFeedId(dto.feedId, session);
        this.logger.log('createChatRoomDocumentByJoinChatRoomReqDto 호출 getFeedSync.Id: ', getFeedSync?.feedId);
        if (!getFeedSync) {
            throw chat_exception_1.ChatException.badRequest('피드 정보를 확인할 수 없습니다.');
        }
        const [authorInfo, userInfo] = await Promise.all([
            this.chatUserRepo.findChatUserDocumentByUserId(Number(getFeedSync.authorId), session),
            this.chatUserRepo.findChatUserDocumentByUserId(Number(user.userId), session),
        ]);
        this.logger.log('[createChatRoomDocumentByJoinChatRoomReqDto] authorInfo: ', authorInfo);
        this.logger.log('[createChatRoomDocumentByJoinChatRoomReqDto] userInfo ', userInfo);
        if (!authorInfo || !userInfo) {
            throw chat_exception_1.ChatException.badRequest('유저 정보를 확인할 수 없습니다.');
        }
        const toMember = (doc) => new chat_user_info_dto_1.ChatUserInfo(doc.userId, doc.username, doc.userNickname, doc.userEmail);
        this.logger.log('toMember 결과: ', toMember(userInfo));
        this.logger.log('toMember 결과: ', toMember(authorInfo));
        const createdChatRoom = await this.chatRoomsRepo.createChatRoomDocument(toMember(userInfo), toMember(authorInfo), dto, feedSync, session);
        return new join_chat_room_resp_dto_1.JoinChatRoomRespDto(createdChatRoom._id.toString(), createdChatRoom.feedInfo, createdChatRoom.chatMembers, Number(createdChatRoom.creatorId), null, createdChatRoom.chatRoomName);
    }
    async getJoinChatRoomRespDto(user, dto, feedSync, session) {
        this.logger.log('[getJoinChatRoomRespDto] getJoinChatRoomRespDto 호출: ');
        const getChatRoom = await this.getValidatedChatRoom(Number(user.userId), dto.roomId, feedSync, session);
        this.logger.log('[getJoinChatRoomRespDto] getChatRoom 조회 결과: ', getChatRoom);
        return await this.buildJoinChatRoomRespDto(user, getChatRoom, session);
    }
    async buildJoinChatRoomRespDto(user, chatRoom, session) {
        this.logger.log('[buildJoinChatRoomRespDto] buildJoinChatRoomRespDto 호출: ', chatRoom._id.toString());
        await this.markAllChatLogsAsReadInRoom(chatRoom, Number(user.userId), session);
        const findChatLogsReqDto = Object.assign(new find_chat_logs_req_dto_1.FindChatLogsReqDto(), {
            roomId: chatRoom._id.toString(),
            size: 20,
        });
        const findChatLogsRespDtoSlice = await this.findChatLogs(user, findChatLogsReqDto, session);
        return new join_chat_room_resp_dto_1.JoinChatRoomRespDto(chatRoom._id.toString(), chatRoom.feedInfo, chatRoom.chatMembers, Number(chatRoom.creatorId), findChatLogsRespDtoSlice, chatRoom.chatRoomName);
    }
    resolveChatRoomReader(chatRoom, userId) {
        const reader = chatRoom.chatMembers.find((chatMember) => chatMember.userId === userId);
        if (!reader) {
            throw chat_exception_1.ChatException.badRequest('채팅방 멤버 정보를 확인할 수 없습니다.');
        }
        return reader;
    }
    async markAllChatLogsAsReadInRoom(chatRoom, userId, session) {
        const roomId = chatRoom._id.toString();
        const latestLogId = await this.chatLogsRepo.findLatestLogIdByRoomId(roomId, session);
        if (!latestLogId) {
            return 0;
        }
        const reader = this.resolveChatRoomReader(chatRoom, userId);
        return this.chatLogsRepo.markChatLogsAsReadUpTo(roomId, reader, latestLogId, session);
    }
    async getValidatedChatRoom(userId, roomId, feedSync, session) {
        this.logger.log('[getValidatedChatRoom] getValidatedChatRoom 호출: ', roomId);
        const getChatRoom = await this.chatRoomsRepo.getChatRoomDocumentById(roomId, session);
        this.logger.log('[getValidatedChatRoom] getChatRoom.id: ', getChatRoom?._id.toString());
        this.logger.log('[getValidatedChatRoom] userId: ', userId);
        this.logger.log('[getValidatedChatRoom] feedSync: ', feedSync?.feedId);
        this.logger.log('[getValidatedChatRoom] roomId: ', roomId);
        if (!getChatRoom) {
            throw chat_exception_1.ChatException.roomNotFound('채팅방 존재하지 않음');
        }
        if (!getChatRoom.chatMembers.some(chatMember => chatMember.userId === userId)) {
            throw chat_exception_1.ChatException.badRequest('채팅방 참여 권한이 없음');
        }
        if (feedSync && getChatRoom.feedInfo.feedId !== feedSync.feedId) {
            throw chat_exception_1.ChatException.badRequest('피드 정보가 일치하지 않습니다.');
        }
        return getChatRoom;
    }
    async sendMessage(user, req, files) {
        if (req.messageType === chat_logs_schema_1.MessageType.TEXT) {
            return this.sendTextMessage(user, req);
        }
        if (req.messageType === chat_logs_schema_1.MessageType.FILE) {
            return this.sendFileMessage(user, req, files);
        }
        throw chat_exception_1.ChatException.badRequest('지원하지 않는 메시지 타입입니다.');
    }
    async sendTextMessage(user, req) {
        const resp = await this.conn.transaction(async (session) => {
            const getChatRoom = await this.getValidatedChatRoom(Number(user.userId), req.roomId, null, session);
            const sender = this.resolveChatRoomSender(getChatRoom, Number(user.userId));
            const chatLog = await this.chatLogsRepo.createTextChatLog(getChatRoom._id.toString(), sender, req.messageType, req.message, session);
            await this.updateChatRoomLastMessage(getChatRoom, req.message ?? '', chatLog._id.toString(), session);
            return new send_message_resp_dto_1.SendMessageRespDto(chatLog);
        });
        this.eventEmitter.emit(chat_message_created_event_dto_1.CHAT_MESSAGE_CREATED, new chat_message_created_event_dto_1.ChatMessageCreatedEvent(req.roomId, resp));
        return resp;
    }
    async sendFileMessage(user, req, files) {
        if (!files || files.length === 0) {
            throw chat_exception_1.ChatException.badRequest('파일을 찾을 수 없습니다.');
        }
        const chatRoom = await this.getValidatedChatRoom(Number(user.userId), req.roomId, null, null);
        const roomId = chatRoom._id.toString();
        this.resolveChatRoomSender(chatRoom, Number(user.userId));
        const uploadedFiles = await this.uploadChatLogFiles(files, roomId);
        const fileMeta = uploadedFiles.map((f) => ({
            originalName: f.originalName,
            storedName: f.key,
            mimeType: f.contentType,
            url: f.url,
        }));
        try {
            const resp = await this.conn.transaction(async (session) => {
                const getChatRoom = await this.getValidatedChatRoom(Number(user.userId), req.roomId, null, session);
                const sender = this.resolveChatRoomSender(getChatRoom, Number(user.userId));
                const chatLog = await this.chatLogsRepo.createFileChatLog(sender, req, fileMeta, session);
                await this.updateChatRoomLastMessage(getChatRoom, '파일 첨부', chatLog._id.toString(), session);
                return new send_message_resp_dto_1.SendMessageRespDto(chatLog);
            });
            this.eventEmitter.emit(chat_message_created_event_dto_1.CHAT_MESSAGE_CREATED, new chat_message_created_event_dto_1.ChatMessageCreatedEvent(req.roomId, resp));
            return resp;
        }
        catch (err) {
            await this.deleteUploadedFiles(uploadedFiles.map((f) => f.url));
            throw err;
        }
    }
    resolveChatRoomSender(chatRoom, userId) {
        const sender = chatRoom.chatMembers.find((chatMember) => chatMember.userId === userId);
        this.logger.log('[sendMessage] sender: ', sender);
        if (!sender) {
            throw chat_exception_1.ChatException.badRequest('채팅방 멤버 정보를 확인할 수 없습니다.');
        }
        return sender;
    }
    async updateChatRoomLastMessage(chatRoom, lastMessage, lastMessageId, session) {
        chatRoom.updatedAt = new Date();
        chatRoom.lastMessage = lastMessage;
        chatRoom.lastMessageId = lastMessageId;
        chatRoom.lastMessageCreatedAt = new Date();
        await chatRoom.save({ session });
    }
    async deleteUploadedFiles(urls) {
        await Promise.all(urls.map(async (url) => {
            try {
                await this.s3Storage.deleteByUrl(url);
            }
            catch (err) {
                this.logger.warn(`S3 rollback failed url=${url}: ${err instanceof Error ? err.message : String(err)}`);
            }
        }));
    }
    async uploadChatLogFile(file, roomId) {
        const key = this.s3Storage.makeObjectKey(`chat/${roomId}`, file.originalname);
        const url = await this.s3Storage.putBuffer(key, file.buffer, file.mimetype || 'application/octet-stream');
        return {
            url,
            key,
            contentType: file.mimetype || 'application/octet-stream',
            originalName: file.originalname,
        };
    }
    async uploadChatLogFiles(files, roomId) {
        return Promise.all(files.map((f) => this.uploadChatLogFile(f, roomId)));
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = ChatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(chat_rooms_repo_1.ChatRoomsRepo)),
    __param(1, (0, common_1.Inject)(chat_logs_repo_1.ChatLogsRepo)),
    __param(2, (0, common_1.Inject)(feed_sync_repo_1.FeedSyncRepo)),
    __param(3, (0, common_1.Inject)(chat_user_repo_1.ChatUserRepo)),
    __param(6, (0, mongoose_2.InjectConnection)()),
    __metadata("design:paramtypes", [chat_rooms_repo_1.ChatRoomsRepo,
        chat_logs_repo_1.ChatLogsRepo,
        feed_sync_repo_1.FeedSyncRepo,
        chat_user_repo_1.ChatUserRepo,
        event_emitter_1.EventEmitter2,
        s3_1.S3StorageService,
        mongoose_1.Connection])
], ChatService);
//# sourceMappingURL=chat.service.js.map