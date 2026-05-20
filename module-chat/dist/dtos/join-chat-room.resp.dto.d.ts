import { FeedInfo } from "../model/chat-rooms.schema";
import { FindChatLogsRespDto } from './find-chat-logs.resp.dto';
import { Slice } from "../config/slice";
import { ChatUserInfo } from './chat-user-info.dto';
export declare class JoinChatRoomRespDto {
    readonly roomId: string;
    readonly feedInfo: FeedInfo;
    readonly chatMembers: ChatUserInfo[];
    readonly creatorId: number;
    readonly chatLogs?: (Slice<FindChatLogsRespDto> | null) | undefined;
    readonly chatRoomName?: string | null | undefined;
    constructor(roomId: string, feedInfo: FeedInfo, chatMembers: ChatUserInfo[], creatorId: number, chatLogs?: (Slice<FindChatLogsRespDto> | null) | undefined, chatRoomName?: string | null | undefined);
}
