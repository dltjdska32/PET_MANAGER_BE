import { MessageType } from "../model/chat-logs.schema";
export declare class SendMessageReqDto {
    roomId: string;
    messageType: MessageType;
    message?: string | null;
}
