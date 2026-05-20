"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildFeedSyncDocumentSet = buildFeedSyncDocumentSet;
exports.buildFeedInfoFromPayload = buildFeedInfoFromPayload;
exports.buildFeedInfoFromFeedSync = buildFeedInfoFromFeedSync;
exports.buildChatRoomFeedInfoSet = buildChatRoomFeedInfoSet;
function parseOptionalDate(value) {
    if (!value) {
        return undefined;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}
function buildFeedSyncDocumentSet(payload) {
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
function buildFeedInfoFromPayload(payload) {
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
function buildFeedInfoFromFeedSync(feedSync) {
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
function buildChatRoomFeedInfoSet(payload) {
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
//# sourceMappingURL=feed-snapshot.util.js.map