package com.petmanager.domain

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document

@Document(collection = "feed_users")
data class FeedUser(
    @Id
    val userId: Long,
    val email: String,
    val nickname: String,
    val regionIds: List<Long> = emptyList()
) {
}
