package com.petmanager.application.dto

enum class SortFlag (
    private val value: String
){
    CREATED_AT ("createdAt"),
    LIKE_COUNT("likeCount"),

}