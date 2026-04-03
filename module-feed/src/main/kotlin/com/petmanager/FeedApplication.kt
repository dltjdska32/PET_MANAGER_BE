package com.petmanager

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration
import org.springframework.boot.autoconfigure.jdbc.DataSourceTransactionManagerAutoConfiguration
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration
import org.springframework.boot.runApplication

/// RDB 관련 자동 설정 제외 (MongoDB만 사용)
@SpringBootApplication(exclude = [
    DataSourceAutoConfiguration::class,
    DataSourceTransactionManagerAutoConfiguration::class,
    HibernateJpaAutoConfiguration::class
])
class FeedApplication

fun main(args: Array<String>) {
    runApplication<FeedApplication>(*args)
}