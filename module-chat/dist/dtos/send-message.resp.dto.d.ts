import { ChatLogDocument, FileMeta, MessageType } from "../model/chat-logs.schema";
import { ChatUserInfo } from "./chat-user-info.dto";
export declare class SendMessageRespDto {
    roomId: string;
    logid: string;
    createdAt: Date;
    sender: ChatUserInfo;
    readUserIds: number[];
    messageType: MessageType;
    message?: string | null;
    file?: FileMeta[];
    isDeleted: boolean;
    updatedAt: Date;
    constructor(chatLog: ChatLogDocument);
}
