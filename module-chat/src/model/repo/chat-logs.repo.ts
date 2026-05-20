import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { ClientSession, QueryFilter } from 'mongoose';
import { Model, Types } from 'mongoose';
import { ChatLog, ChatLogDocument, FileMeta, MessageType } from '../chat-logs.schema';
import type { BasicUserInfo } from 'src/config/auth/basic-user-info';
import { FindChatLogsReqDto } from 'src/dtos/find-chat-logs.req.dto';
import { FindChatLogsRespDto } from 'src/dtos/find-chat-logs.resp.dto';
import { ChatUserInfo } from 'src/dtos/chat-user-info.dto';
import { SendMessageReqDto } from 'src/dtos/send-message.req.dto';
import { NextCursor, Slice } from 'src/config/slice';
import { ChatException } from 'src/config/exception/chat.exception';

@Injectable()
export class ChatLogsRepo {
  constructor(
    @InjectModel(ChatLog.name)
    private readonly model: Model<ChatLogDocument>,
  ) {}

  /// 키셋방식 조회.
  async getFindChatLogsRespDtoSlice(
    user: BasicUserInfo,
    dto: FindChatLogsReqDto,
    session?: ClientSession | null,
  ): Promise<Slice<FindChatLogsRespDto>> {
    void user;

    const filter: QueryFilter<ChatLogDocument> = {
      roomId: dto.roomId,
      isDeleted: false,
    };

    if (dto.lastCreatedAt != null && dto.lastId != null) {
      const lastCreatedAt = new Date(dto.lastCreatedAt);
      const lastId = new Types.ObjectId(dto.lastId);

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

    const toChatUserInfoDto = (u: {
      userId: number;
      username: string;
      userNickname: string;
      userEmail: string;
    }) => new ChatUserInfo(u.userId, u.username, u.userNickname, u.userEmail);

    const nextCursor: NextCursor | null =
      hasNext && slicedChatLogs.length > 0
        ? new NextCursor(
            slicedChatLogs[slicedChatLogs.length - 1]._id.toString(),
            new Date(slicedChatLogs[slicedChatLogs.length - 1].createdAt),
          )
        : null;

    const respDtos = slicedChatLogs.map(
      (cl) =>
        new FindChatLogsRespDto(
          cl.roomId,
          cl._id.toString(),
          new Date(cl.createdAt),
          toChatUserInfoDto(cl.sender),
          (cl.readUserIds ?? []).map((u) => u.userId),
          cl.messageType,
          cl.message,
          cl.file,
        ),
    );

    return new Slice<FindChatLogsRespDto>(respDtos, hasNext, nextCursor);
  }



  async findLatestLogIdByRoomId(
    roomId: string,
    session?: ClientSession | null,
  ): Promise<string | null> {
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

  async markChatLogsAsReadUpTo(
    roomId: string,
    reader: ChatUserInfo,
    lastMessageId: string,
    session: ClientSession,
  ): Promise<number> {

    if (!Types.ObjectId.isValid(lastMessageId)) {
      throw ChatException.badRequest('메시지 ID가 올바르지 않습니다.');
    }

    const result = await this.model.updateMany(
      {
        roomId,
        isDeleted: false,
        _id: { $lte: new Types.ObjectId(lastMessageId) },
        'readUserIds.userId': { $ne: Number(reader.userId) },   // 이미 추가된 건 제외
      },
      {
        $push: { readUserIds: reader },
      },
      { session },
    );

    return result.modifiedCount;
  }

  async createTextChatLog(
    roomId: string,
    sender: ChatUserInfo,
    messageType: MessageType,
    message: string | null | undefined,
    session: ClientSession,
  ): Promise<ChatLogDocument> {

    const [doc] = await this.model.create(
      [
        {
          roomId,
          messageType,
          message: message ?? undefined,
          sender,
          readUserIds: [sender],
          isDeleted: false,
        },
      ],
      { session },
    );

    return doc;
  }

  async createFileChatLog(
    sender: ChatUserInfo,
    req: SendMessageReqDto,
    files: FileMeta[],
    session: ClientSession,
  ): Promise<ChatLogDocument> {
    const [doc] = await this.model.create(
      [
        {
          roomId: req.roomId,
          messageType: MessageType.FILE,
          sender,
          readUserIds: [sender],
          file: files,
          isDeleted: false,
        },
      ],
      { session },
    );

    return doc;
  }
}
