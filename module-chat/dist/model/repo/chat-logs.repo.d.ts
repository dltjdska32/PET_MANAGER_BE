import type { ClientSession } from 'mongoose';
import { Model } from 'mongoose';
import { ChatLogDocument, FileMeta, MessageType } from '../chat-logs.schema';
import type { BasicUserInfo } from "../../config/auth/basic-user-info";
import { FindChatLogsReqDto } from "../../dtos/find-chat-logs.req.dto";
import { FindChatLogsRespDto } from "../../dtos/find-chat-logs.resp.dto";
import { ChatUserInfo } from "../../dtos/chat-user-info.dto";
import { SendMessageReqDto } from "../../dtos/send-message.req.dto";
import { Slice } from "../../config/slice";
export declare class ChatLogsRepo {
    private readonly model;
    constructor(model: Model<ChatLogDocument>);
    getFindChatLogsRespDtoSlice(user: BasicUserInfo, dto: FindChatLogsReqDto, session?: ClientSession | null): Promise<Slice<FindChatLogsRespDto>>;
    findLatestLogIdByRoomId(roomId: string, session?: ClientSession | null): Promise<string | null>;
    markChatLogsAsReadUpTo(roomId: string, reader: ChatUserInfo, lastMessageId: string, session: ClientSession): Promise<number>;
    createTextChatLog(roomId: string, sender: ChatUserInfo, messageType: MessageType, message: string | null | undefined, session: ClientSession): Promise<ChatLogDocument>;
    createFileChatLog(sender: ChatUserInfo, req: SendMessageReqDto, files: FileMeta[], session: ClientSession): Promise<ChatLogDocument>;
}
