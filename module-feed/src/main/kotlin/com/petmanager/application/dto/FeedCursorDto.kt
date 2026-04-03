package com.petmanager.application.dto

import com.petmanager.application.dto.SortFlag
import java.time.LocalDateTime

data class FeedCursorDto(
    var feedId: String? = null,
    var likesCount: Int? = null,
    var createdAt: LocalDateTime? = null
) {


    fun getSortValue(sortFlag: SortFlag): Comparable<*>? {
        return when (sortFlag) {
            SortFlag.LIKE_COUNT -> likesCount
            SortFlag.CREATED_AT -> createdAt ?: feedId
        }
    }
}
