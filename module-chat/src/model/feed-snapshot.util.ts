import { FeedInfo } from '../model/chat-rooms.schema';

export interface FeedChatSyncPayload {
  id: string;
  authorId: string;
  username?: string;
  authorNickname?: string;
  title?: string;
  description?: string;
  regionId?: number;
  mainImgUrl?: string[];
  sideImgUrl?: string[];
  pay?: number;
  startDate?: string | null;
  endDate?: string | null;
  likesCount?: number;
  feedType?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  isDeleted?: boolean;
}

function parseOptionalDate(value?: string | null): Date | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function buildFeedSyncDocumentSet(payload: FeedChatSyncPayload): Record<string, unknown> {
  return {
    feedId: payload.id,
    authorId: payload.authorId,
    username: payload.username ?? payload.authorNickname ?? '',
    authorNickname: payload.authorNickname ?? '',
    title: payload.title ?? '',
    description: payload.description ?? '',
    regionId: payload.regionId ?? 0,
    mainImgUrl: payload.mainImgUrl ?? [],
    sideImgUrl: payload.sideImgUrl ?? [],
    pay: payload.pay ?? 0,
    startDate: parseOptionalDate(payload.startDate),
    endDate: parseOptionalDate(payload.endDate),
    likesCount: payload.likesCount ?? 0,
    feedType: payload.feedType ?? 'COMMUNICATION',
    feedCreatedAt: parseOptionalDate(payload.createdAt),
    feedUpdatedAt: parseOptionalDate(payload.updatedAt),
    isDeleted: payload.isDeleted ?? false,
  };
}

export function buildFeedInfoFromPayload(payload: FeedChatSyncPayload): FeedInfo {
  return {
    feedId: payload.id,
    authorId: Number(payload.authorId),
    authorUsername: payload.username ?? payload.authorNickname ?? '',
    authorNickname: payload.authorNickname ?? '',
    title: payload.title ?? '',
    description: payload.description ?? '',
    regionId: payload.regionId ?? 0,
    mainImgUrl: payload.mainImgUrl ?? [],
    sideImgUrl: payload.sideImgUrl ?? [],
    pay: payload.pay ?? 0,
    startDate: parseOptionalDate(payload.startDate),
    endDate: parseOptionalDate(payload.endDate),
    likesCount: payload.likesCount ?? 0,
    feedType: payload.feedType ?? 'COMMUNICATION',
    feedCreatedAt: parseOptionalDate(payload.createdAt),
    feedUpdatedAt: parseOptionalDate(payload.updatedAt),
  };
}

export function buildFeedInfoFromFeedSync(feedSync: {
  feedId: string;
  authorId: string;
  username?: string;
  authorNickname: string;
  title: string;
  description?: string;
  regionId?: number;
  mainImgUrl?: string[];
  sideImgUrl?: string[];
  pay?: number;
  startDate?: Date;
  endDate?: Date;
  likesCount?: number;
  feedType?: string;
  feedCreatedAt?: Date;
  feedUpdatedAt?: Date;
}): FeedInfo {
  return {
    feedId: feedSync.feedId,
    authorId: Number(feedSync.authorId),
    authorUsername: feedSync.username ?? feedSync.authorNickname,
    authorNickname: feedSync.authorNickname,
    title: feedSync.title,
    description: feedSync.description ?? '',
    regionId: feedSync.regionId ?? 0,
    mainImgUrl: feedSync.mainImgUrl ?? [],
    sideImgUrl: feedSync.sideImgUrl ?? [],
    pay: feedSync.pay ?? 0,
    startDate: feedSync.startDate,
    endDate: feedSync.endDate,
    likesCount: feedSync.likesCount ?? 0,
    feedType: feedSync.feedType ?? 'COMMUNICATION',
    feedCreatedAt: feedSync.feedCreatedAt,
    feedUpdatedAt: feedSync.feedUpdatedAt,
  };
}

export function buildChatRoomFeedInfoSet(payload: FeedChatSyncPayload): Record<string, unknown> {
  const feedInfo = buildFeedInfoFromPayload(payload);
  return {
    'feedInfo.feedId': feedInfo.feedId,
    'feedInfo.authorId': feedInfo.authorId,
    'feedInfo.authorUsername': feedInfo.authorUsername,
    'feedInfo.authorNickname': feedInfo.authorNickname,
    'feedInfo.title': feedInfo.title,
    'feedInfo.description': feedInfo.description,
    'feedInfo.regionId': feedInfo.regionId,
    'feedInfo.mainImgUrl': feedInfo.mainImgUrl,
    'feedInfo.sideImgUrl': feedInfo.sideImgUrl,
    'feedInfo.pay': feedInfo.pay,
    'feedInfo.startDate': feedInfo.startDate,
    'feedInfo.endDate': feedInfo.endDate,
    'feedInfo.likesCount': feedInfo.likesCount,
    'feedInfo.feedType': feedInfo.feedType,
    'feedInfo.feedCreatedAt': feedInfo.feedCreatedAt,
    'feedInfo.feedUpdatedAt': feedInfo.feedUpdatedAt,
  };
}
