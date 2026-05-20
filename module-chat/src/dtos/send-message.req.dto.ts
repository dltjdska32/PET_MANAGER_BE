import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { MessageType } from 'src/model/chat-logs.schema';

export class SendMessageReqDto {
  @IsNotEmpty()
  public roomId: string;

  @IsEnum(MessageType)
  @IsNotEmpty()
  public messageType: MessageType;

  @IsOptional()
  public message?: string | null;
}
