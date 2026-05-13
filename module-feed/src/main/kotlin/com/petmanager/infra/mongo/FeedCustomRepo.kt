package com.petmanager.infra.mongo

import com.petmanager.application.dto.FindFeedReqDto
import com.petmanager.application.dto.FindFeedRespDto
import com.petmanager.domain.Feed
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Slice

interface FeedCustomRepo {
    fun findFeed(pageable: Pageable, req: FindFeedReqDto): Slice<FindFeedRespDto>
    fun findUserFeed(pageable: Pageable, userId: String): Slice<FindFeedRespDto>
    fun updateLikesCount(id: String, count: Int)
}
