import { InjectModel } from '@nestjs/mongoose';
import type { ClientSession, Model } from 'mongoose';
import { FeedSync, FeedSyncDocument } from '../feed-sync.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FeedSyncRepo {
  constructor(
    @InjectModel(FeedSync.name)
    private readonly model: Model<FeedSyncDocument>,
  ) {}

  async findFeedSyncDocumentByFeedId(
    feedId: string,
    session?: ClientSession | null,
  ): Promise<FeedSyncDocument | null> {
    const query = this.model.findOne({ feedId, isDeleted: false });
    if (session) {
      query.session(session);
    }
    return query.exec();
  }
}
