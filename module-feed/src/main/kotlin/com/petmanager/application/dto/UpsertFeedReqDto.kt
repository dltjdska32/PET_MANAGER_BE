package com.petmanager.application.dto

import com.petmanager.domain.enums.FeedType
import jakarta.validation.constraints.AssertTrue
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import org.hibernate.validator.constraints.Length
import org.springframework.web.multipart.MultipartFile
import java.time.LocalDate

data class UpsertFeedReqDto(

    var feedId: String? = null,

    @field:NotNull
    var userNickname: String? = null,

    @field:Size(min = 1, max = 1, message = "메인 이미지는 필수 입니다.")
    var mainImgs: List<MultipartFile>,

    @field:Size(min = 0, max = 5, message = "서브 이미지는 최대 5장까지 가능합니다.")
    var sideImgs: List<MultipartFile>,

    @field:Length(max = 100, message = "제목은 최대 100자 이내로 입력 가능합니다.")
    @field:NotBlank(message = "제목은 필수입니다.")
    var title: String,

    @field:NotNull(message = "카테고리는 필수입니다.")
    var feedType: FeedType,

    var description: String = "",

    var startDate: LocalDate? = null,

    var endDate: LocalDate? = null,

    var pay: Int,

    @field:NotNull("지역 정보는 필수입니다.")
    var regionId: Long? = null
) {

    /**
     * 날짜 필수 여부 검증 - 소통 타입이 아니면 무조건 입력
     */
    @AssertTrue(message = "시작일과 종료일은 필수입니다.")
    fun isDateRequired(): Boolean {
        if (feedType != FeedType.COMMUNICATION) {
            return startDate != null && endDate != null
        }
        return true
    }

    /**
     * 날짜 검증
     */
    @AssertTrue(message = "시작일은 종료일보다 늦을 수 없습니다.")
    fun isValidDateRange(): Boolean {
        if (startDate == null || endDate == null) return true
        return !startDate!!.isAfter(endDate)
    }

    /**
     *  급여 검증 - 소통 피드가 아닐 경우에만 0원 이상인이 확인
     */
    @AssertTrue(message = "급여는 0원 이상이어야 합니다.")
    fun isValidPay(): Boolean {
        if (feedType != FeedType.COMMUNICATION) {
            return pay >= 0
        }
        return true
    }
}