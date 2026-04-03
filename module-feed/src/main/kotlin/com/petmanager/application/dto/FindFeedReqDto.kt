package com.petmanager.application.dto

import com.petmanager.domain.enums.FeedType
import jakarta.validation.constraints.NotNull

data class FindFeedReqDto(
    var feedType: FeedType? = FeedType.COMMUNICATION,
    var keyword: String = "",
    var sort: SortFlag = SortFlag.CREATED_AT,
    
    // 키셋 페이지네이션을 위한 커서 dto
    var cursor: FeedCursorDto? = null,

    @field:NotNull(message = "지역 정보는 필수입니다.")
    var regionId: Long? = null
)