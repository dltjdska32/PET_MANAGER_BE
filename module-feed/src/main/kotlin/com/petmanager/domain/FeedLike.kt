package com.petmanager.domain

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.CompoundIndex
import org.springframework.data.mongodb.core.mapping.Document
import java.time.LocalDateTime

/**
 * 피드 좋아요 도큐먼트
 * 복합인덱스 설정해서 빠르게 조회 및 유니크를 걸어 중복 좋아요 방지.
 */
@Document(collection = "feed_like")
@CompoundIndex(name = "user_feed_like_idx", def = "{'userId': 1, 'feedId': 1}", unique = true)
data class FeedLike(
    @Id
    var id: String? = null,

    val userId: String,

    val feedId: String,

    @CreatedDate
    val createdAt: LocalDateTime = LocalDateTime.now()
) {
    companion object {
        fun of(userId: String, feedId: String): FeedLike {
            return FeedLike(
                userId = userId,
                feedId = feedId
            )
        }
    }
}
