import { SendMessageRespDto } from "./send-message.resp.dto";

export const CHAT_MESSAGE_CREATED = 'chat.message.created';

export class ChatMessageCreatedEvent {
  constructor(
    public readonly roomId: string,
    public readonly payload: SendMessageRespDto,
  ) {}
}