import { FileMeta, MessageType } from "src/model/chat-logs.schema";
import { ChatUserInfo } from "./chat-user-info.dto";

export class FindChatLogsRespDto {
    constructor(
        public readonly roomId: string,
        public readonly logid: string,
        public readonly createdAt: Date,
        public readonly sender: ChatUserInfo,
        public readonly readUserIds: number[],
        public readonly messageType: MessageType,
        public readonly message?: string,
        public readonly file?: FileMeta[],
    ) {
    }
}

