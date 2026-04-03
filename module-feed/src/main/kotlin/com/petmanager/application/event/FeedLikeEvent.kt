package com.petmanager.application.event

/**
 * 피드 좋아요 이벤트
 */
data class FeedLikeEvent(
    val feedId: String,
    val count: Int // 1 이면 증가, -1 이면 감소
)
