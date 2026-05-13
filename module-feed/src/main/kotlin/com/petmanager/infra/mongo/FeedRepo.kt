package com.petmanager.infra.mongo

import com.petmanager.domain.Feed
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.MongoRepository

interface FeedRepo : MongoRepository<Feed, String>, FeedCustomRepo {
}
