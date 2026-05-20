export class WsReadMessageDto {
  constructor(
    public readonly roomId: string,
    public readonly lastMessageId: string,
  ) {}
}
