import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChatUserDocument = HydratedDocument<ChatUser>;

@Schema({
  collection: 'chat_users',
  timestamps: true,
  versionKey: false
})

export class ChatUser {
  @Prop({ required: true })
  userId: number;

  @Prop({ required: true })
  username: string;

  @Prop({ required: false })
  userNickname: string = "unknown";

  @Prop({ required: true })
  userEmail: string;

  @Prop({ required: false, default: 'ROLE_USER' })
  userRole: string;

  @Prop({ required: false })
  userMainImgUrl?: string;

  @Prop({ type: [Number], default: [] })
  userRegionIds: number[];

  @Prop({ default: false })
  isDeleted: boolean;

  createdAt: Date;

  updatedAt: Date;
}

export const ChatUserSchema = SchemaFactory.createForClass(ChatUser);
