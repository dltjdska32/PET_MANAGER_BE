import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FeedSyncDocument = HydratedDocument<FeedSync>;

@Schema({
  collection: 'feed_sync',
  timestamps: true,
  versionKey: false,
})
export class FeedSync {
  @Prop({ required: true, unique: true })
  feedId: string;

  @Prop({ required: true })
  authorId: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  authorNickname: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, default: '' })
  description: string;

  @Prop({ required: true })
  regionId: number;

  @Prop({ type: [String], default: [] })
  mainImgUrl: string[];

  @Prop({ type: [String], default: [] })
  sideImgUrl: string[];

  @Prop({ default: 0 })
  pay: number;

  @Prop({ required: false })
  startDate?: Date;

  @Prop({ required: false })
  endDate?: Date;

  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ required: true })
  feedType: string;

  @Prop({ required: false })
  feedCreatedAt?: Date;

  @Prop({ required: false })
  feedUpdatedAt?: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  createdAt: Date;

  updatedAt: Date;
}

export const FeedSyncSchema = SchemaFactory.createForClass(FeedSync);
