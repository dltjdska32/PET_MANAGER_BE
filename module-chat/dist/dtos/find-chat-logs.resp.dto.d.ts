import { FileMeta, MessageType } from "../model/chat-logs.schema";
import { ChatUserInfo } from "./chat-user-info.dto";
export declare class FindChatLogsRespDto {
    readonly roomId: string;
    readonly logid: string;
    readonly createdAt: Date;
    readonly sender: ChatUserInfo;
    readonly readUserIds: number[];
    readonly messageType: MessageType;
    readonly message?: string | undefined;
    readonly file?: FileMeta[] | undefined;
    constructor(roomId: string, logid: string, createdAt: Date, sender: ChatUserInfo, readUserIds: number[], messageType: MessageType, message?: string | undefined, file?: FileMeta[] | undefined);
}
