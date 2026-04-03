package com.petmanager.infra.mongo

import com.petmanager.domain.FeedUser
import org.springframework.data.mongodb.repository.MongoRepository

interface FeedUserRepo : MongoRepository<FeedUser, Long>
