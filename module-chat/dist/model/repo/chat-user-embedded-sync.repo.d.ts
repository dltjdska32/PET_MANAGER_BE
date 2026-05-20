import type { ClientSession } from 'mongoose';
import { Model } from 'mongoose';
import { ChatLogDocument } from '../chat-logs.schema';
import { ChatRoomDocument } from '../chat-rooms.schema';
import { FeedSyncDocument } from '../feed-sync.schema';
export type EmbeddedChatUserPatch = {
    username?: string;
    userNickname?: string;
    userEmail?: string;
};
export declare class ChatUserEmbeddedSyncRepo {
    private readonly chatRoomModel;
    private readonly chatLogModel;
    private readonly feedSyncModel;
    constructor(chatRoomModel: Model<ChatRoomDocument>, chatLogModel: Model<ChatLogDocument>, feedSyncModel: Model<FeedSyncDocument>);
    syncEmbeddedUserProfile(userId: number, patch: EmbeddedChatUserPatch, session?: ClientSession | null): Promise<void>;
    private syncChatRoomMembers;
    private syncChatRoomFeedAuthor;
    private syncFeedSyncAuthor;
    private syncChatLogSender;
    private syncChatLogReaders;
    private buildArrayPathSet;
    private buildObjectFieldSet;
}
