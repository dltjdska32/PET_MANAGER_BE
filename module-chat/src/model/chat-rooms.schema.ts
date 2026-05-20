import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ChatUserInfo } from 'src/dtos/chat-user-info.dto';

export type ChatRoomDocument = HydratedDocument<ChatRoom>;

export type FeedInfo = {
  feedId: string;
  authorId: number;
  authorUsername: string;
  authorNickname: string;
  title: string;
  description: string;
  regionId: number;
  mainImgUrl: string[];
  sideImgUrl: string[];
  pay: number;
  startDate?: Date;
  endDate?: Date;
  likesCount: number;
  feedType: string;
  feedCreatedAt?: Date;
  feedUpdatedAt?: Date;
};

const feedInfoSchema = {
  feedId: String,
  authorId: Number,
  authorUsername: String,
  authorNickname: String,
  title: String,
  description: String,
  regionId: Number,
  mainImgUrl: [String],
  sideImgUrl: [String],
  pay: Number,
  startDate: Date,
  endDate: Date,
  likesCount: Number,
  feedType: String,
  feedCreatedAt: Date,
  feedUpdatedAt: Date,
};

@Schema({
  collection: 'chat_rooms',
  timestamps: true,
  versionKey: false,
})
export class ChatRoom {
  @Prop({
    type: feedInfoSchema,
    required: true,
  })
  feedInfo: FeedInfo;

  @Prop({ required: false, default: 'default_chat_room' })
  chatRoomName?: string;

  @Prop({ required: true })
  creatorId: number;

  @Prop({
    type: [{
      userId: { type: Number, required: true },
      username: { type: String, required: false },
      userNickname: { type: String, required: true },
      userEmail: { type: String, required: true },
    }],
    default: [],
  })
  chatMembers: ChatUserInfo[];

  @Prop({ required: false })
  lastMessage?: string;
  
  @Prop({ required: false })
  lastMessageId?: string;
  
  @Prop({ required: false })
  lastMessageCreatedAt?: Date;

  createdAt: Date;

  updatedAt: Date;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
