package com.petmanager.ui

import com.petmanager.application.FeedLikeService
import com.petmanager.application.dto.FindFeedRespDto
import com.petmanager.config.Response
import com.petmanager.dto.BasicUserInfo
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Slice
import org.springframework.data.web.PageableDefault
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime

@RestController
@RequestMapping("/likes")
@Tag(name = "FEED-LIKE-API", description = "피드 좋아요 관련 API 엔드포인트")
class FeedLikeController(
    private val feedLikeService: FeedLikeService
) {

    /**
     * 피드 좋아요 API
     */
    @PostMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "피드 좋아요 토글", description = "좋아요가 안 되어 있으면 등록, 되어 있으면 취소.")
    fun upsertLike(@PathVariable id: String,
                   @AuthenticationPrincipal user: BasicUserInfo): Response<Unit> {
        feedLikeService.upsertLike(id, user)
        return Response.ok()
    }

    /**
     * 내가 좋아요 한 피드 목록 조회 API
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "내가 좋아요 한 피드 목록", description = "본인이 좋아요 누른 피드들을 20개씩 페이징")
    fun findMyLikedFeeds(
        @PageableDefault(size = 20) pageable: Pageable,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) lastCreatedAt: LocalDateTime?,
        @RequestParam(required = false) lastId: String?,
        @AuthenticationPrincipal user: BasicUserInfo
    ): Response<Slice<FindFeedRespDto>> {
        return Response.ok(feedLikeService.findLikedFeeds(pageable, lastCreatedAt, lastId, user))
    }
}
