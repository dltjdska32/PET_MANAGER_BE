package com.petmanager.infra.mongo

import com.petmanager.domain.FeedLike
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Slice
import java.time.LocalDateTime

interface FeedLikeCustomRepo {
    /**
     * @param lastCreatedAt 마지막으로 조회된 좋아요 생성 시간
     * @param lastId 마지막으로 조회된 좋아요 도큐먼트 ID
     */
    fun findLikedFeeds(
        userId: String, 
        pageable: Pageable, 
        lastCreatedAt: LocalDateTime?, 
        lastId: String?
    ): Slice<FeedLike>
}
