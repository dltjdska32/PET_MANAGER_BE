import { ClientSession, Model } from 'mongoose';
import { ChatRoomDocument } from '../chat-rooms.schema';
import type { BasicUserInfo } from "../../config/auth/basic-user-info";
import { Slice } from "../../config/slice";
import { FindChatRoomsRespDto } from "../../dtos/find-chat-rooms.resp.dto";
import { FindChatRoomsReqDto } from "../../dtos/find-chat-rooms.req.dto";
import { JoinChatRoomReqDto } from "../../dtos/join-chat-room.req.dto";
import { FeedSyncDocument } from '../feed-sync.schema';
import { ChatUserInfo } from "../../dtos/chat-user-info.dto";
export declare class ChatRoomsRepo {
    private readonly model;
    constructor(model: Model<ChatRoomDocument>);
    getChatRoomDocumentById(roomId: string, session?: ClientSession | null): Promise<ChatRoomDocument | null>;
    getChatRoomDocumentByFeedIdAndUserId(feedId: string, userId: number, session?: ClientSession | null): Promise<ChatRoomDocument | null>;
    createChatRoomDocument(creatorInfo: ChatUserInfo, authorInfo: ChatUserInfo, dto: JoinChatRoomReqDto, feedSync: FeedSyncDocument, session?: ClientSession | null): Promise<ChatRoomDocument>;
    getFindChatRoomsRespDtoSlice(user: BasicUserInfo, req: FindChatRoomsReqDto, session?: ClientSession | null): Promise<Slice<FindChatRoomsRespDto>>;
}
