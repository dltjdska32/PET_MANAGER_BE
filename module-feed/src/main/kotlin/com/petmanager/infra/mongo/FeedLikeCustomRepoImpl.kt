package com.petmanager.infra.mongo

import com.petmanager.domain.FeedLike
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Slice
import org.springframework.data.domain.SliceImpl
import org.springframework.data.domain.Sort
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.stereotype.Component
import java.time.LocalDateTime

@Component
class FeedLikeCustomRepoImpl(
    private val mongoTemplate: MongoTemplate
) : FeedLikeCustomRepo {

    /**
     *  좋아요 목록 커서 방식(Keyset) 페이징 조회
     */
    override fun findLikedFeeds(
        userId: String,
        pageable: Pageable,
        lastCreatedAt: LocalDateTime?,
        lastId: String?
    ): Slice<FeedLike> {
        val query = Query(Criteria.where("userId").`is`(userId))

        //커서 로직
        if (lastCreatedAt != null && lastId != null) {
            query.addCriteria(Criteria().orOperator(
                Criteria.where("createdAt").lt(lastCreatedAt),
                Criteria.where("createdAt").`is`(lastCreatedAt).and("_id").lt(lastId)
            ))
        }

        // 최신순(createdAt DESC), 동점 시 ID 역순(_id DESC)
        query.with(Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("_id")))

        query.limit(pageable.pageSize + 1)

        val content = mongoTemplate.find(query, FeedLike::class.java, "feed_like")
        
        var results = content
        val hasNext = content.size > pageable.pageSize

        if (hasNext) {
            results = content.subList(0, pageable.pageSize)
        }

        return SliceImpl(results, pageable, hasNext)
    }
}
