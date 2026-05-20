import { SendMessageRespDto } from "./send-message.resp.dto";
export declare const CHAT_MESSAGE_CREATED = "chat.message.created";
export declare class ChatMessageCreatedEvent {
    readonly roomId: string;
    readonly payload: SendMessageRespDto;
    constructor(roomId: string, payload: SendMessageRespDto);
}
