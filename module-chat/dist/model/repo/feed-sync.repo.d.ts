import type { ClientSession, Model } from 'mongoose';
import { FeedSyncDocument } from '../feed-sync.schema';
export declare class FeedSyncRepo {
    private readonly model;
    constructor(model: Model<FeedSyncDocument>);
    findFeedSyncDocumentByFeedId(feedId: string, session?: ClientSession | null): Promise<FeedSyncDocument | null>;
}
