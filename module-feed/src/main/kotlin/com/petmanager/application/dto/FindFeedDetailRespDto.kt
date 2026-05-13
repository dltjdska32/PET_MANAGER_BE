package com.petmanager.application.dto

import com.petmanager.domain.enums.FeedType
import java.time.LocalDate
import java.time.LocalDateTime

data class FindFeedDetailRespDto(
    val id: String,
    val authorId: String,
    val username: String,
    val authorNickname: String,
    val title: String,
    val description: String,
    val regionId: Long,
    val mainImgUrl: List<String>,
    val sideImgUrl: List<String>,
    val pay: Int,
    val startDate: LocalDate?,
    val endDate: LocalDate?,
    val likesCount: Int,
    val feedType: FeedType,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val isLiked: Boolean
)

