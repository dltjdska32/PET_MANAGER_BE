import { FeedInfo } from 'src/model/chat-rooms.schema';
import { FindChatLogsRespDto } from './find-chat-logs.resp.dto';
import { Slice } from 'src/config/slice';
import { ChatUserInfo } from './chat-user-info.dto';

export class JoinChatRoomRespDto {
  constructor(
    public readonly roomId: string,
    public readonly feedInfo: FeedInfo,
    public readonly chatMembers: ChatUserInfo[],
    public readonly creatorId: number,
    public readonly chatLogs?: Slice<FindChatLogsRespDto> | null,
    public readonly chatRoomName?: string | null,
  ) {}
}
