package com.petmanager.domain

import com.petmanager.domain.enums.FeedType
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.LocalDate
import java.time.LocalDateTime


@Document(collection = "feed")
data class Feed(
    @Id
    var id: String? = null,

    val authorId: String,

    val username: String,

    val authorNickname: String,

    var title: String,

    var description: String,

    var regionId: Long,

    var mainImgUrl: List<String> = emptyList(),

    var sideImgUrl: List<String> = emptyList(),

    var pay: Int = 0,

    var startDate: LocalDate?,

    var endDate: LocalDate?,

    var likesCount: Int = 0,

    var feedType: FeedType = FeedType.COMMUNICATION,

    /// 2글자씩 쪼갠 검색어
    @Indexed
    var searchTokens: List<String> = emptyList(),

    @CreatedDate
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @LastModifiedDate
    var updatedAt: LocalDateTime = LocalDateTime.now(),

    var isDeleted: Boolean = false
) {


    companion object {

        fun of(authorId: String,
               authorName: String,
               authorNickname: String,
               title: String,
               description: String,
               regionId: Long,
               mainImgUrl: List<String>,
               sideImgUrl: List<String>,
               searchTokens: List<String>,
               pay: Int,
               startDate: LocalDate?,
               endDate: LocalDate?,
               feedType: FeedType): Feed {
            return Feed(
                authorId = authorId,
                username = authorName,
                authorNickname = authorNickname,
                title = title,
                description = description,
                regionId = regionId,
                mainImgUrl = mainImgUrl,
                sideImgUrl = sideImgUrl,
                searchTokens = searchTokens,
                pay = pay,
                startDate = startDate,
                endDate = endDate,
                feedType = feedType
            )
        }

        /**
         * n-gram분석 라이브러리 없이 직접 2글자씩 쪼개주는 메서드
         */
        fun generateTokens(input: String): List<String> {
            val cleanText = input.replace("\\s".toRegex(), "").lowercase()
            
            if (cleanText.isEmpty()) return emptyList()
            if (cleanText.length < 2) return listOf(cleanText)

            return cleanText.windowed(2).distinct()
        }


    } // static 메서드


    fun delete() {
        this.isDeleted = true
    }

    fun update(
        title: String,
        description: String,
        regionId: Long,
        mainImgUrl: List<String>,
        sideImgUrl: List<String>,
        pay: Int,
        startDate: LocalDate?,
        endDate: LocalDate?,
        feedType: FeedType,
        searchTokens: List<String>
    ) {
        this.title = title
        this.description = description
        this.regionId = regionId
        this.mainImgUrl = mainImgUrl
        this.sideImgUrl = sideImgUrl
        this.pay = pay
        this.startDate = startDate
        this.endDate = endDate
        this.feedType = feedType
        this.searchTokens = searchTokens
        this.updatedAt = LocalDateTime.now()
    }
}