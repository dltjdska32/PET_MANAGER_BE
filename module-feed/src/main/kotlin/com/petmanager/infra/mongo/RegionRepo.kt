package com.petmanager.infra.mongo

import com.petmanager.domain.Region
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository

@Repository
interface RegionRepo : MongoRepository<Region, Long> {
}
