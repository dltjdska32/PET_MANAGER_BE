package com.petmanager.infra.mongo

import com.petmanager.domain.FeedLike
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Slice
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface FeedLikeRepo : MongoRepository<FeedLike, String>, FeedLikeCustomRepo {

    // 특정 유저가 특정 피드에 좋아요를 눌렀는지 확인
    fun findByUserIdAndFeedId(userId: String, feedId: String): Optional<FeedLike>

    // 좋아요 취소 처리를 위한 삭제용
    fun deleteByUserIdAndFeedId(userId: String, feedId: String)
}
