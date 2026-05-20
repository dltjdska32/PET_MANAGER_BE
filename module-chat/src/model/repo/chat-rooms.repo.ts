import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, QueryFilter, Types } from 'mongoose';
import { ChatRoom, ChatRoomDocument } from '../chat-rooms.schema';
import type { BasicUserInfo } from 'src/config/auth/basic-user-info';
import { NextCursor, Slice } from 'src/config/slice';
import { FindChatRoomsRespDto } from 'src/dtos/find-chat-rooms.resp.dto';

import { FindChatRoomsReqDto } from 'src/dtos/find-chat-rooms.req.dto';
import { JoinChatRoomReqDto } from 'src/dtos/join-chat-room.req.dto';
import { FeedSyncDocument } from '../feed-sync.schema';
import { ChatUserInfo } from 'src/dtos/chat-user-info.dto';
import { buildFeedInfoFromFeedSync } from '../feed-snapshot.util';

@Injectable()
export class ChatRoomsRepo {
  constructor(
    @InjectModel(ChatRoom.name)
    private readonly model: Model<ChatRoomDocument>,
  ) {}

  /// 트랜잭션 적용 가능하게 session 전달 -null 허용
  async getChatRoomDocumentById(roomId: string, session?: ClientSession | null): Promise<ChatRoomDocument | null> {
    
    if (!Types.ObjectId.isValid(roomId)) {
      return null;
    }

    const query = this.model.findById(new Types.ObjectId(roomId)).where('isDeleted').equals(false);
    if (session) {
      query.session(session);
    }

    return query.exec();
  }

  async getChatRoomDocumentByFeedIdAndUserId(
    feedId: string,
    userId: number,
    session?: ClientSession | null,
  ): Promise<ChatRoomDocument | null> {
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


  async createChatRoomDocument(
    creatorInfo: ChatUserInfo,
    authorInfo: ChatUserInfo,
    dto: JoinChatRoomReqDto,
    feedSync: FeedSyncDocument,
    session?: ClientSession | null,
  ): Promise<ChatRoomDocument> {

    const [doc] = await this.model.create(
      [
        {
          feedInfo: buildFeedInfoFromFeedSync(feedSync),
          creatorId: Number(creatorInfo.userId),
          chatMembers: [creatorInfo, authorInfo],
          chatRoomName: dto.chatRoomName,
        },
      ],
      session ? { session } : {},
    );
    return doc;

  }



  
  async getFindChatRoomsRespDtoSlice(
    user: BasicUserInfo,
    req: FindChatRoomsReqDto,
    session?: ClientSession | null,
  ): Promise<Slice<FindChatRoomsRespDto>> {

    const query: QueryFilter<ChatRoomDocument> = {
      isDeleted: false,
      chatMembers: { $elemMatch: { userId: Number(user.userId) } },
    };

    if(req.lastUpdatedAt != null && req.lastRoomId != null) {
        query.$or = [
            { updatedAt: { $lt: req.lastUpdatedAt } },
            { updatedAt: { $eq: req.lastUpdatedAt }, _id: { $lt: new Types.ObjectId(req.lastRoomId) } },
        ];
    }

    const q =  this.model
      .find(query)
      .sort({ updatedAt: -1 })
      .limit(req.size + 1);

    if(session) {
      q.session(session);
    }

    const chatRooms = await q.exec();

    const hasNext = chatRooms.length > req.size;

    const slicedChatRooms = hasNext ? chatRooms.slice(0, req.size) : chatRooms;


    const nextCursor = hasNext && slicedChatRooms.length > 0 ? 
        new NextCursor(slicedChatRooms[slicedChatRooms.length - 1]._id.toString(),
         new Date(slicedChatRooms[slicedChatRooms.length - 1].updatedAt)) : null;

    const respDtos = slicedChatRooms.map((r) =>
        new FindChatRoomsRespDto(
            r._id.toString(),
            r.feedInfo.feedId,
            r.feedInfo.mainImgUrl?.[0] ?? null,
            r.feedInfo.title,
            r.feedInfo.authorId,
            r.feedInfo.authorNickname,
            r.lastMessage ?? null,
            r.lastMessageId ?? null,
            r.lastMessageCreatedAt ?? null,
            new Date(r.createdAt),
            r.chatRoomName,
        ));

    return new Slice<FindChatRoomsRespDto>(respDtos, hasNext, nextCursor);
  }
}
