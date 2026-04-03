package com.petmanager.infra.mongo

import com.petmanager.application.dto.FindFeedReqDto
import com.petmanager.application.dto.FindFeedRespDto
import com.petmanager.application.dto.SortFlag
import com.petmanager.domain.Feed
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Slice
import org.springframework.data.domain.SliceImpl
import org.springframework.data.domain.Sort
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import org.springframework.stereotype.Component

@Component
class FeedCustomRepoImpl(
    private val mongoTemplate: MongoTemplate
) : FeedCustomRepo {

    override fun findFeed(pageable: Pageable, req: FindFeedReqDto): Slice<FindFeedRespDto> {
        val query = Query()
        // 삭제되지 않은 피드만 조회
        query.addCriteria(Criteria.where("isDeleted").`is`(false))
        
        // 프로젝션
        query.fields().include("id", "title", "mainImgUrl", "likesCount", "regionId", "authorNickname", "createdAt")

        // 동적 필터
        if (req.keyword.isNotBlank()) {
            val tokens = Feed.generateTokens(req.keyword)
            query.addCriteria(Criteria.where("searchTokens").`all`(tokens))
        }
        if (req.feedType != null) {
            query.addCriteria(Criteria.where("feedType").`is`(req.feedType))
        }
        if (req.regionId != null) {
            query.addCriteria(Criteria.where("regionId").`is`(req.regionId))
        }

        // 커서 방식 페이징
        if (req.sort == SortFlag.CREATED_AT) {
            if (req.cursor != null) {
                val lastValue = req.cursor!!.createdAt
                val lastId = req.cursor!!.feedId
                if (lastValue != null && lastId != null) {
                    query.addCriteria(Criteria().orOperator(
                        Criteria.where("createdAt").lt(lastValue),
                        Criteria.where("createdAt").`is`(lastValue).and("_id").lt(lastId)
                    ))
                }
            }
            query.with(Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("_id")))
        } else if (req.sort == SortFlag.LIKE_COUNT) {
            if (req.cursor != null) {
                val lastValue = req.cursor!!.likesCount
                val lastId = req.cursor!!.feedId
                if (lastValue != null && lastId != null) {
                    query.addCriteria(Criteria().orOperator(
                        Criteria.where("likesCount").lt(lastValue),
                        Criteria.where("likesCount").`is`(lastValue).and("_id").lt(lastId)
                    ))
                }
            }
            query.with(Sort.by(Sort.Order.desc("likesCount"), Sort.Order.desc("_id")))
        }

        query.limit(pageable.pageSize + 1)

        val content = mongoTemplate.find(query, FindFeedRespDto::class.java, "feed")

        var results = content
        val hasNext = content.size > pageable.pageSize

        if (hasNext) {
            results = content.subList(0, pageable.pageSize)
        }

        return SliceImpl(results, pageable, hasNext)
    }

    /**
     *  좋아요수 원자적 증감 (Atomic $inc)
     */
    override fun updateLikesCount(id: String, count: Int) {
        val query = Query(Criteria.where("_id").`is`(id))
        val update = Update().inc("likesCount", count)
        mongoTemplate.updateFirst(query, update, "feed")
    }
}
