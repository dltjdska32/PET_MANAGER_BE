package com.petmanager.ui

import com.petmanager.application.FeedService
import com.petmanager.application.dto.FindFeedReqDto
import com.petmanager.application.dto.FindFeedDetailRespDto
import com.petmanager.application.dto.FindFeedRespDto
import com.petmanager.application.dto.UpsertFeedReqDto
import com.petmanager.config.Response
import com.petmanager.domain.Feed
import com.petmanager.dto.BasicUserInfo
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Slice
import org.springframework.data.web.PageableDefault
import org.springframework.http.MediaType
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@Tag(name = "FEED-API", description = "피드 관련 API 엔드포인트")
class FeedController(

    private val feedService: FeedService
) {

    /**
     * 피드 삭제
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "피드 삭제", description = "피드 ID로 해당 피드를 삭제.")
    fun deleteFeed(@PathVariable id: String,
                   @AuthenticationPrincipal user: BasicUserInfo): Response<Unit> {
        feedService.deleteFeed(id, user)
        return Response.ok()
    }

    /**
     * 피드 업서트 API
     */
    @PostMapping(consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "피드 생성 및 수정", description = "피드 ID 유무에 따라 생성 또는 수정을 수행합니다.")
    fun upsertFeed(@ModelAttribute @Valid req: UpsertFeedReqDto,
                   @AuthenticationPrincipal user: BasicUserInfo): Response<Unit> {

        feedService.upsertFeed(req, user)

        return Response.ok()
    }

    /**
     * 피드 전체 조회. (20개씩 페이징)
     */
    @GetMapping
    @Operation(summary = "피드 검색 및 필터링", description = "키워드, 타입, 지역별로 피드를 조회.")
    fun findFeed(@PageableDefault(size = 20) pageable: Pageable,
                      @AuthenticationPrincipal user: BasicUserInfo?,
                      @ModelAttribute @Valid req: FindFeedReqDto): Response<Slice<FindFeedRespDto>> {

        var userId : Long? = user?.userId()


        return Response.ok(feedService.findFeed(pageable, req, userId))
    }


    /**
     * 내 게시글 보기
     */
    @PreAuthorize("hasRole('USER')")
    @GetMapping("/me")
    @Operation(summary = "내 게시글 조회", description = "유저의 게시글 조회.")
    fun findUserFeed(@PageableDefault(size = 20) pageable: Pageable,
                 @AuthenticationPrincipal user: BasicUserInfo): Response<Slice<FindFeedRespDto>> {

        val userId : Long = user.userId()

        return Response.ok(feedService.findUserFeed(pageable, userId))
    }

    /**
     *  피드 상세 조회
     */
    @GetMapping("/{id}")
    @Operation(summary = "피드 상세 조회", description = "피드 ID로 상세 정보를 조회.")
    fun findFeedDetails(
        @PathVariable id: String,
        @AuthenticationPrincipal user: BasicUserInfo?
    ): Response<FindFeedDetailRespDto> {
        return Response.ok(feedService.findFeedById(id, user?.userId()))
    }
}
