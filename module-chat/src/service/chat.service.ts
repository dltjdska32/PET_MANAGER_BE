import { Inject, Injectable, Logger } from '@nestjs/common';
import type { BasicUserInfo } from '../config/auth/basic-user-info';
import { FindChatLogsReqDto } from '../dtos/find-chat-logs.req.dto';
import { FindChatLogsRespDto } from 'src/dtos/find-chat-logs.resp.dto';
import { Slice } from 'src/config/slice';
import { JoinChatRoomReqDto } from 'src/dtos/join-chat-room.req.dto';
import { JoinChatRoomRespDto } from 'src/dtos/join-chat-room.resp.dto';
import { ChatException } from 'src/config/exception/chat.exception';
import { ChatLogsRepo } from 'src/model/repo/chat-logs.repo';
import { ChatRoomsRepo } from 'src/model/repo/chat-rooms.repo';
import { FindChatRoomsRespDto } from 'src/dtos/find-chat-rooms.resp.dto';
import { FeedSyncRepo } from 'src/model/repo/feed-sync.repo';
import { FeedSyncDocument } from 'src/model/feed-sync.schema';
import { FindChatRoomsReqDto } from 'src/dtos/find-chat-rooms.req.dto';
import { ClientSession, Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { ChatRoomDocument } from 'src/model/chat-rooms.schema';
import { SendMessageReqDto } from 'src/dtos/send-message.req.dto';
import { MessageType } from 'src/model/chat-logs.schema';
import { ChatUserRepo } from 'src/model/repo/chat-user.repo';
import { ChatUserDocument } from 'src/model/chat-user.schema';
import { ChatUserInfo } from 'src/dtos/chat-user-info.dto';
import { S3StorageService } from 'src/infra/s3';
import { SendMessageRespDto } from 'src/dtos/send-message.resp.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CHAT_MESSAGE_CREATED, ChatMessageCreatedEvent } from 'src/dtos/chat_message_created.event.dto';
import { WsReadMessageDto } from 'src/dtos/ws-read-message.dto';
import { LeaveChatRoomReqDto } from 'src/dtos/leave-chat-room.req.dto';
import {ChatRoomLeftRespDto } from 'src/dtos/chat-room-left.resp.dto';

@Injectable()
export class ChatService {

  private readonly logger = new Logger(ChatService.name);


  constructor(
    @Inject(ChatRoomsRepo) private readonly chatRoomsRepo: ChatRoomsRepo,
    @Inject(ChatLogsRepo) private readonly chatLogsRepo: ChatLogsRepo,
    @Inject(FeedSyncRepo) private readonly feedSyncRepo: FeedSyncRepo,
    @Inject(ChatUserRepo) private readonly chatUserRepo: ChatUserRepo,
    private readonly eventEmitter: EventEmitter2,
    private readonly s3Storage: S3StorageService,
    @InjectConnection() private readonly conn : Connection,
  ) {}


  /// 메시지 읽음 처리
  async readMessage(userId: number, message: WsReadMessageDto) {
    return await this.conn.transaction(async (session) => {
      const chatRoom = await this.getValidatedChatRoom(userId, message.roomId, null, session);
      const reader = this.resolveChatRoomReader(chatRoom, userId);

      await this.chatLogsRepo.markChatLogsAsReadUpTo(
        message.roomId,
        reader,
        message.lastMessageId,
        session,
      );
    });
  }

 
  

  /// 유저가 접속한 채팅리스트 조회
  async findChatRooms(
    user: BasicUserInfo,
    req: FindChatRoomsReqDto,
  ): Promise<Slice<FindChatRoomsRespDto>> {
    return await this.chatRoomsRepo.getFindChatRoomsRespDtoSlice(user, req, null);
  }

  /// 챗로그 조회 커서 키셋 형식
  async findChatLogs(
    user: BasicUserInfo,
    req: FindChatLogsReqDto,
    session?: ClientSession | null,
  ): Promise<Slice<FindChatLogsRespDto>> {

    this.logger.log('[findChatLogs] findChatLogs 호출 roomId: ', req.roomId);

    await this.getValidatedChatRoom(Number(user.userId), req.roomId, null, session);

    return await this.chatLogsRepo.getFindChatLogsRespDtoSlice(user, req, session);
  }

  

  /// 챗방 입장 (upsert)
  async createOrGetChatRoom(
    user: BasicUserInfo,
    dto: JoinChatRoomReqDto,
  ): Promise<JoinChatRoomRespDto> {

    return await this.conn.transaction(async (session) => {

      this.logger.log('[createOrGetChatRoom] dto: ', dto);
      this.logger.log('[createOrGetChatRoom] user: ', user);

      if (!dto.feedId) {
        throw ChatException.badRequest('피드 아이디를 확인할 수 없습니다.');
      }

      const feedSync = await this.feedSyncRepo.findFeedSyncDocumentByFeedId(dto.feedId, session);

      if (!feedSync) {
        throw ChatException.badRequest('피드 정보를 확인할 수 없습니다.');
      }

       /// 룸아이디로 요청이오면 조회
      if (dto.roomId) {

        return await this.getJoinChatRoomRespDto(
          user,
          dto,
          feedSync,
          session,
        );
      }

      // 피드아이디와 유저아이디를 통해 챗룸이있는지 확인
      const existingChatRoom = await this.chatRoomsRepo.getChatRoomDocumentByFeedIdAndUserId(
        dto.feedId,
        Number(user.userId),
        session,
      );

        /// 챗룸이 있으면 챗룸 정보 반환
      if (existingChatRoom) {
      
        return await this.buildJoinChatRoomRespDto(user, existingChatRoom, session);
      }

      /// 챗룸이 없으면 챗룸 생성
      return await this.createChatRoomDocumentByJoinChatRoomReqDto(
        user,
        dto,
        feedSync,
        session,
      );
    });
  }

  /// 채팅방 나가기
  async leaveChatRoom(userId: number, req: LeaveChatRoomReqDto): Promise<ChatRoomLeftRespDto> {

    return await this.conn.transaction(async (session) => {

      const chatRoom = await this.getValidatedChatRoom(userId, req.roomId, null, session);
     
      const leftMember = chatRoom.chatMembers.find(
        (member) => member.userId === userId,
      );
      
      if (!leftMember) {
        throw ChatException.badRequest('채팅방 멤버 정보를 확인할 수 없습니다.');
      }
      
      /// 나간 유저 제거.
      chatRoom.chatMembers = chatRoom.chatMembers.filter(
        (member) => member.userId !== userId,
      );


      /// 더티체킹
      await chatRoom.save({ session });

      return new ChatRoomLeftRespDto(req.roomId, leftMember.userNickname, leftMember.userId);
    
    });

  }

  /// 채팅방 생성 (채팅방 생성 후 반환)
  async createChatRoomDocumentByJoinChatRoomReqDto(
    user: BasicUserInfo,
    dto: JoinChatRoomReqDto,
    feedSync: FeedSyncDocument,
    session: ClientSession | null,
  ): Promise<JoinChatRoomRespDto> {
    
  

    const getFeedSync = await this.feedSyncRepo.findFeedSyncDocumentByFeedId(dto.feedId, session);
    

    this.logger.log('createChatRoomDocumentByJoinChatRoomReqDto 호출 getFeedSync.Id: ', getFeedSync?.feedId);

    if (!getFeedSync) {
      throw ChatException.badRequest('피드 정보를 확인할 수 없습니다.');
    }



    const [authorInfo, userInfo] = await Promise.all([
      this.chatUserRepo.findChatUserDocumentByUserId(Number(getFeedSync.authorId), session),
      this.chatUserRepo.findChatUserDocumentByUserId(Number(user.userId), session),
    ]);

    this.logger.log('[createChatRoomDocumentByJoinChatRoomReqDto] authorInfo: ', authorInfo);
    this.logger.log('[createChatRoomDocumentByJoinChatRoomReqDto] userInfo ', userInfo);

    if (!authorInfo || !userInfo) {
      throw ChatException.badRequest('유저 정보를 확인할 수 없습니다.');
    }

    const toMember = (doc: ChatUserDocument) =>
      new ChatUserInfo(doc.userId, doc.username, doc.userNickname, doc.userEmail);

    this.logger.log('toMember 결과: ', toMember(userInfo));
    this.logger.log('toMember 결과: ', toMember(authorInfo));

    const createdChatRoom = await this.chatRoomsRepo.createChatRoomDocument(
      toMember(userInfo),
      toMember(authorInfo),
      dto,
      feedSync,
      session,
    );

    return new JoinChatRoomRespDto(
      createdChatRoom._id.toString(),
      createdChatRoom.feedInfo,
      createdChatRoom.chatMembers,
      Number(createdChatRoom.creatorId),
      null,  /// 채팅로그 조회 결과 없음
      createdChatRoom.chatRoomName,
    );
  }

  /// 채팅방 조회 (검증후 반환)
  async getJoinChatRoomRespDto(
    user: BasicUserInfo,
    dto: JoinChatRoomReqDto,
    feedSync: FeedSyncDocument,
    session: ClientSession
  ): Promise<JoinChatRoomRespDto> {

    this.logger.log('[getJoinChatRoomRespDto] getJoinChatRoomRespDto 호출: ');

    const getChatRoom = await this.getValidatedChatRoom(Number(user.userId), dto.roomId!, feedSync, session);


    this.logger.log('[getJoinChatRoomRespDto] getChatRoom 조회 결과: ', getChatRoom);

    
    return await this.buildJoinChatRoomRespDto(user, getChatRoom, session);
  }

  private async buildJoinChatRoomRespDto(
    user: BasicUserInfo,
    chatRoom: ChatRoomDocument,
    session: ClientSession,
  ): Promise<JoinChatRoomRespDto> {

    this.logger.log('[buildJoinChatRoomRespDto] buildJoinChatRoomRespDto 호출: ', chatRoom._id.toString());

    ///읽음 처리
    await this.markAllChatLogsAsReadInRoom(chatRoom, Number(user.userId), session);

    const findChatLogsReqDto = Object.assign(new FindChatLogsReqDto(), {
      roomId: chatRoom._id.toString(),
      size: 20,
    });
    
    const findChatLogsRespDtoSlice = await this.findChatLogs(user, findChatLogsReqDto, session);

    return new JoinChatRoomRespDto(
      chatRoom._id.toString(),
      chatRoom.feedInfo,
      chatRoom.chatMembers,
      Number(chatRoom.creatorId),
      findChatLogsRespDtoSlice,
      chatRoom.chatRoomName,
    );
  }

  private resolveChatRoomReader(
    chatRoom: ChatRoomDocument,
    userId: number,
  ): ChatUserInfo {
    const reader = chatRoom.chatMembers.find(
      (chatMember) => chatMember.userId === userId,
    );

    if (!reader) {
      throw ChatException.badRequest('채팅방 멤버 정보를 확인할 수 없습니다.');
    }

    return reader;
  }

  private async markAllChatLogsAsReadInRoom(
    chatRoom: ChatRoomDocument,
    userId: number,
    session: ClientSession,
  ): Promise<number> {
    const roomId = chatRoom._id.toString();
    const latestLogId = await this.chatLogsRepo.findLatestLogIdByRoomId(roomId, session);

    if (!latestLogId) {
      return 0;
    }

    const reader = this.resolveChatRoomReader(chatRoom, userId);
    return this.chatLogsRepo.markChatLogsAsReadUpTo(roomId, reader, latestLogId, session);
  }





  /// 채팅방 검증후 반환.
  async getValidatedChatRoom(
    userId: number,
    roomId: string,
    feedSync?: FeedSyncDocument | null,
    session?: ClientSession | null,
  ): Promise<ChatRoomDocument> {

      this.logger.log('[getValidatedChatRoom] getValidatedChatRoom 호출: ', roomId);
       /// roomId 는 반드시 존재
       const getChatRoom = await this.chatRoomsRepo.getChatRoomDocumentById(roomId, session);

       this.logger.log('[getValidatedChatRoom] getChatRoom.id: ', getChatRoom?._id.toString());
       this.logger.log('[getValidatedChatRoom] userId: ', userId);
       this.logger.log('[getValidatedChatRoom] feedSync: ', feedSync?.feedId);
       this.logger.log('[getValidatedChatRoom] roomId: ', roomId);

       if (!getChatRoom) {
         throw ChatException.roomNotFound('채팅방 존재하지 않음');
       }
   
       if (!getChatRoom.chatMembers.some(chatMember => chatMember.userId === userId)) {
         throw ChatException.badRequest('채팅방 참여 권한이 없음');
       }
   
       if (feedSync && getChatRoom.feedInfo.feedId !== feedSync.feedId) {
         throw ChatException.badRequest('피드 정보가 일치하지 않습니다.');
       }
   
       return getChatRoom;
  }




  /// 메시지 전송 파일 or 텍스트
  async sendMessage(user: BasicUserInfo, req: SendMessageReqDto, files?: Express.Multer.File[] | null)
  : Promise<SendMessageRespDto> {
    if (req.messageType === MessageType.TEXT) {
      return this.sendTextMessage(user, req);
    }

    if (req.messageType === MessageType.FILE) {
      return this.sendFileMessage(user, req, files);
    }

    throw ChatException.badRequest('지원하지 않는 메시지 타입입니다.');
  }

  private async sendTextMessage(
    user: BasicUserInfo,
    req: SendMessageReqDto,
  ): Promise<SendMessageRespDto> {
    const resp = await this.conn.transaction(async (session) => {
      const getChatRoom = await this.getValidatedChatRoom(
        Number(user.userId),
        req.roomId,
        null,
        session,
      );

      const sender = this.resolveChatRoomSender(getChatRoom, Number(user.userId));

      const chatLog = await this.chatLogsRepo.createTextChatLog(
        getChatRoom._id.toString(),
        sender,
        req.messageType,
        req.message,
        session,
      );

      await this.updateChatRoomLastMessage(
        getChatRoom,
        req.message ?? '',
        chatLog._id.toString(),
        session,
      );

      return new SendMessageRespDto(chatLog);
    });

    this.eventEmitter.emit(
      CHAT_MESSAGE_CREATED,
      new ChatMessageCreatedEvent(req.roomId, resp),
    );

    return resp;
  }

  private async sendFileMessage(
    user: BasicUserInfo,
    req: SendMessageReqDto,
    files?: Express.Multer.File[] | null,
  ): Promise<SendMessageRespDto> {
    if (!files || files.length === 0) {
      throw ChatException.badRequest('파일을 찾을 수 없습니다.');
    }

    const chatRoom = await this.getValidatedChatRoom(
      Number(user.userId),
      req.roomId,
      null,
      null,
    );
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
        const getChatRoom = await this.getValidatedChatRoom(
          Number(user.userId),
          req.roomId,
          null,
          session,
        );

        const sender = this.resolveChatRoomSender(getChatRoom, Number(user.userId));

        const chatLog = await this.chatLogsRepo.createFileChatLog(
          sender,
          req,
          fileMeta,
          session,
        );

        await this.updateChatRoomLastMessage(
          getChatRoom,
          '파일 첨부',
          chatLog._id.toString(),
          session,
        );

        return new SendMessageRespDto(chatLog);
      });

      this.eventEmitter.emit(
        CHAT_MESSAGE_CREATED,
        new ChatMessageCreatedEvent(req.roomId, resp),
      );

      return resp;
    } catch (err) {
      await this.deleteUploadedFiles(uploadedFiles.map((f) => f.url));
      throw err;
    }
  }

  private resolveChatRoomSender(
    chatRoom: ChatRoomDocument,
    userId: number,
  ): ChatUserInfo {
    const sender = chatRoom.chatMembers.find(
      (chatMember) => chatMember.userId === userId,
    );

    this.logger.log('[sendMessage] sender: ', sender);

    if (!sender) {
      throw ChatException.badRequest('채팅방 멤버 정보를 확인할 수 없습니다.');
    }

    return sender;
  }

  private async updateChatRoomLastMessage(
    chatRoom: ChatRoomDocument,
    lastMessage: string,
    lastMessageId: string,
    session: ClientSession,
  ): Promise<void> {
    chatRoom.updatedAt = new Date();
    chatRoom.lastMessage = lastMessage;
    chatRoom.lastMessageId = lastMessageId;
    chatRoom.lastMessageCreatedAt = new Date();

    await chatRoom.save({ session });
  }

  private async deleteUploadedFiles(urls: string[]): Promise<void> {
    await Promise.all(
      urls.map(async (url) => {
        try {
          await this.s3Storage.deleteByUrl(url);
        } catch (err: unknown) {
          this.logger.warn(
            `S3 rollback failed url=${url}: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }),
    );
  }


  async uploadChatLogFile(file: Express.Multer.File, roomId: string)
  : Promise<{ url: string; key: string; contentType: string; originalName: string }> {

    const key = this.s3Storage.makeObjectKey(`chat/${roomId}`, file.originalname);

    const url = await this.s3Storage.putBuffer( 
      key , 
      file.buffer, 
      file.mimetype ||  'application/octet-stream',);
 
    return {
      url,
      key,
      contentType: file.mimetype || 'application/octet-stream',
      originalName: file.originalname,
    }
  }


  async uploadChatLogFiles(files: Express.Multer.File[], roomId: string) {
    return Promise.all(files.map((f) => this.uploadChatLogFile(f, roomId)));
  }
}
