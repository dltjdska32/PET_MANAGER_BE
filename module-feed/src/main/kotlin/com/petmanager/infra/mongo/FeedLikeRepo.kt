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

    // 피드 리스트(예: 20개)에 대한 좋아요 여부를 1번에 조회
    fun findByUserIdAndFeedIdIn(userId: String, feedId: Collection<String>): List<FeedLike>

    // 좋아요 취소 처리를 위한 삭제용
    fun deleteByUserIdAndFeedId(userId: String, feedId: String)
}
