package com.petmanager.domain

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document

@Document(collection = "feed_users")
data class FeedUser(
    @Id
    val userId: Long,
    val username: String,
    val email: String,
    val nickname: String,
    val role: String = "ROLE_USER",
    val userMainImgUrl: String? = null,
    val regionIds: List<Long> = emptyList(),
) {
}
