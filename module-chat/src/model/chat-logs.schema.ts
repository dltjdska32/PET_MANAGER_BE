import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ChatUserInfo } from 'src/dtos/chat-user-info.dto';

export type ChatLogDocument = HydratedDocument<ChatLog>;

export interface FileMeta {
  originalName: string;
  storedName: string;
  mimeType: string;
  url: string;
}

export enum MessageType {
  FILE = 'FILE',
  TEXT = 'TEXT',
}

@Schema({
  collection: 'chat_logs',
  timestamps: true,
  versionKey: false,
})
export class ChatLog {
  @Prop({ required: true })
  roomId: string;

  @Prop({ type: String, enum: MessageType, required: true })
  messageType: MessageType;

  @Prop({ required: false })
  message?: string;

  @Prop({ type: ChatUserInfo, required: true })
  sender: ChatUserInfo;

  @Prop({ type: [ChatUserInfo], default: [] })
  readUserIds: ChatUserInfo[];

  @Prop({
    type: [
      {
        originalName: String,
        storedName: String,
        mimeType: String,
        url: String,
      },
    ],
    required: false,
  })
  file?: FileMeta[];

  @Prop({ default: false })
  isDeleted: boolean;

  createdAt: Date;

  updatedAt: Date;
}

export const ChatLogSchema = SchemaFactory.createForClass(ChatLog);
