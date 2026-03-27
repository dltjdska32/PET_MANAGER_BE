package com.petmanager
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.runApplication



@SpringBootApplication
@EntityScan(basePackages = [
    "com.petmanager.domain",
    "com.petmanager.global.domain.Region"
])
class FeedApplication
fun main(args: Array<String>) {
    runApplication<FeedApplication>(*args)
}