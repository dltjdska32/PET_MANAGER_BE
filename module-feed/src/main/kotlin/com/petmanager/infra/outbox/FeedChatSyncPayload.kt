package com.petmanager.infra.outbox

import com.fasterxml.jackson.annotation.JsonInclude
import com.petmanager.domain.Feed

/**
 * 챗 서버로 동기화하는 피드 전체 스냅샷 (스트림 value JSON).
 * searchTokens 등 챗에서 쓰지 않는 내부 필드는 제외한다.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
data class FeedChatSyncPayload(
    val id: String,
    val authorId: String,
    val username: String,
    val authorNickname: String,
    val title: String,
    val description: String,
    val regionId: Long,
    val mainImgUrl: List<String> = emptyList(),
    val sideImgUrl: List<String> = emptyList(),
    val pay: Int = 0,
    val startDate: String? = null,
    val endDate: String? = null,
    val likesCount: Int = 0,
    val feedType: String,
    val createdAt: String? = null,
    val updatedAt: String? = null,
    val isDeleted: Boolean = false,
) {
    companion object {
        fun from(feed: Feed): FeedChatSyncPayload {
            val feedId = feed.id
                ?: throw IllegalStateException("피드 id가 없습니다.")

            return FeedChatSyncPayload(
                id = feedId,
                authorId = feed.authorId,
                username = feed.username,
                authorNickname = feed.authorNickname,
                title = feed.title,
                description = feed.description,
                regionId = feed.regionId,
                mainImgUrl = feed.mainImgUrl,
                sideImgUrl = feed.sideImgUrl,
                pay = feed.pay,
                startDate = feed.startDate?.toString(),
                endDate = feed.endDate?.toString(),
                likesCount = feed.likesCount,
                feedType = feed.feedType.name,
                createdAt = feed.createdAt.toString(),
                updatedAt = feed.updatedAt.toString(),
                isDeleted = feed.isDeleted,
            )
        }
    }
}
