package com.petmanager.application.dto

data class FindFeedRespDto (
    var id: String,
    var title: String,
    var mainImgUrl: List<String>,
    var likesCount: Int,
    var regionId: Long,
    var authorNickname: String,
)