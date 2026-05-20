import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { ClientSession } from 'mongoose';
import { Model } from 'mongoose';
import { ChatLog, ChatLogDocument } from '../chat-logs.schema';
import { ChatRoom, ChatRoomDocument } from '../chat-rooms.schema';
import { FeedSync, FeedSyncDocument } from '../feed-sync.schema';

export type EmbeddedChatUserPatch = {
  username?: string;
  userNickname?: string;
  userEmail?: string;
};

@Injectable()
export class ChatUserEmbeddedSyncRepo {
  constructor(
    @InjectModel(ChatRoom.name)
    private readonly chatRoomModel: Model<ChatRoomDocument>,
    @InjectModel(ChatLog.name)
    private readonly chatLogModel: Model<ChatLogDocument>,
    @InjectModel(FeedSync.name)
    private readonly feedSyncModel: Model<FeedSyncDocument>,
  ) {}

  /**
   * chat_rooms.chatMembers, chat_logs.sender/readUserIds, feed_sync/chat_rooms.feedInfo 등
   * Auth 유저 프로필이 denormalize 된 필드를 userId 기준으로 일괄 반영한다.
   */
  async syncEmbeddedUserProfile(
    userId: number,
    patch: EmbeddedChatUserPatch,
    session?: ClientSession | null,
  ): Promise<void> {
    if (
      patch.username === undefined &&
      patch.userNickname === undefined &&
      patch.userEmail === undefined
    ) {
      return;
    }

    await Promise.all([
      this.syncChatRoomMembers(userId, patch, session),
      this.syncChatRoomFeedAuthor(userId, patch, session),
      this.syncFeedSyncAuthor(userId, patch, session),
      this.syncChatLogSender(userId, patch, session),
      this.syncChatLogReaders(userId, patch, session),
    ]);
  }

  private async syncChatRoomMembers(
    userId: number,
    patch: EmbeddedChatUserPatch,
    session?: ClientSession | null,
  ): Promise<void> {
    const $set = this.buildArrayPathSet('chatMembers', 'member', patch);
    if (Object.keys($set).length === 0) {
      return;
    }

    await this.chatRoomModel.updateMany(
      { isDeleted: false, 'chatMembers.userId': userId },
      { $set },
      {
        arrayFilters: [{ 'member.userId': userId }],
        session: session ?? undefined,
      },
    );
  }

  private async syncChatRoomFeedAuthor(
    userId: number,
    patch: EmbeddedChatUserPatch,
    session?: ClientSession | null,
  ): Promise<void> {
    const $set: Record<string, string> = {};

    if (patch.userNickname !== undefined) {
      $set['feedInfo.authorNickname'] = patch.userNickname;
    }
    if (patch.username !== undefined) {
      $set['feedInfo.authorUsername'] = patch.username;
    }

    if (Object.keys($set).length === 0) {
      return;
    }

    await this.chatRoomModel.updateMany(
      { isDeleted: false, 'feedInfo.authorId': userId },
      { $set },
      { session: session ?? undefined },
    );
  }

  private async syncFeedSyncAuthor(
    userId: number,
    patch: EmbeddedChatUserPatch,
    session?: ClientSession | null,
  ): Promise<void> {
    const $set: Record<string, string> = {};

    if (patch.userNickname !== undefined) {
      $set.authorNickname = patch.userNickname;
    }
    if (patch.username !== undefined) {
      $set.username = patch.username;
    }

    if (Object.keys($set).length === 0) {
      return;
    }

    await this.feedSyncModel.updateMany(
      { isDeleted: false, authorId: String(userId) },
      { $set },
      { session: session ?? undefined },
    );
  }

  private async syncChatLogSender(
    userId: number,
    patch: EmbeddedChatUserPatch,
    session?: ClientSession | null,
  ): Promise<void> {
    const $set = this.buildObjectFieldSet('sender', patch);
    if (Object.keys($set).length === 0) {
      return;
    }

    await this.chatLogModel.updateMany(
      { isDeleted: false, 'sender.userId': userId },
      { $set },
      { session: session ?? undefined },
    );
  }

  private async syncChatLogReaders(
    userId: number,
    patch: EmbeddedChatUserPatch,
    session?: ClientSession | null,
  ): Promise<void> {
    const $set = this.buildArrayPathSet('readUserIds', 'reader', patch);
    if (Object.keys($set).length === 0) {
      return;
    }

    await this.chatLogModel.updateMany(
      { isDeleted: false, 'readUserIds.userId': userId },
      { $set },
      {
        arrayFilters: [{ 'reader.userId': userId }],
        session: session ?? undefined,
      },
    );
  }

  private buildArrayPathSet(
    arrayPath: string,
    elemAlias: string,
    patch: EmbeddedChatUserPatch,
  ): Record<string, string> {
    const $set: Record<string, string> = {};

    if (patch.username !== undefined) {
      $set[`${arrayPath}.$[${elemAlias}].username`] = patch.username;
    }
    if (patch.userNickname !== undefined) {
      $set[`${arrayPath}.$[${elemAlias}].userNickname`] = patch.userNickname;
    }
    if (patch.userEmail !== undefined) {
      $set[`${arrayPath}.$[${elemAlias}].userEmail`] = patch.userEmail;
    }

    return $set;
  }

  private buildObjectFieldSet(
    prefix: string,
    patch: EmbeddedChatUserPatch,
  ): Record<string, string> {
    const $set: Record<string, string> = {};

    if (patch.username !== undefined) {
      $set[`${prefix}.username`] = patch.username;
    }
    if (patch.userNickname !== undefined) {
      $set[`${prefix}.userNickname`] = patch.userNickname;
    }
    if (patch.userEmail !== undefined) {
      $set[`${prefix}.userEmail`] = patch.userEmail;
    }

    return $set;
  }
}
