package com.petmanager.application

import com.petmanager.application.dto.FeedCursorDto
import com.petmanager.application.dto.FindFeedRespDto
import com.petmanager.application.event.FeedLikeEvent
import com.petmanager.domain.Feed
import com.petmanager.domain.FeedLike
import com.petmanager.dto.BasicUserInfo
import com.petmanager.infra.mongo.FeedLikeRepo
import com.petmanager.infra.mongo.FeedRepo
import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Slice
import org.springframework.data.domain.SliceImpl
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional(readOnly = true)
class FeedLikeService(
    private val feedRepo: FeedRepo,
    private val feedLikeRepo: FeedLikeRepo,
    private val eventPublisher: ApplicationEventPublisher
) {

    /**
     * 좋아요 토글 (좋아요 / 취소)
     */
    @Transactional(readOnly = false)
    fun upsertLike(feedId: String, user: BasicUserInfo) {
        val userId = user.userId.toString()
        val existingLike = feedLikeRepo.findByUserIdAndFeedId(userId, feedId)

        if (existingLike.isPresent) {
            // 이미 좋아요 한 상태면 취소
            feedLikeRepo.deleteByUserIdAndFeedId(userId, feedId)
            // 결합도를 낮추기 위해 이벤트발행
            eventPublisher.publishEvent(FeedLikeEvent(feedId, -1))
        } else {
            // 좋아요 등록
            feedLikeRepo.save(FeedLike.of(userId, feedId))
            // 결합도를 낮추기 위해 이벤트발행
            eventPublisher.publishEvent(FeedLikeEvent(feedId, 1))
        }
    }

    /**
     * 내가 좋아요 누른 피드 목록 조회
     */
    fun findLikedFeeds(
        pageable: Pageable,
        lastCreatedAt: LocalDateTime?,
        lastId: String?,
        user: BasicUserInfo
    ): Slice<FindFeedRespDto> {
        val userId = user.userId.toString()

        // 유저의 좋아요 내역을 커서 방식으로 20개 가져옴
        val likeSlice = feedLikeRepo.findLikedFeeds(userId, pageable, lastCreatedAt, lastId)
        
        //  피드 ID 목록 추출
        val feedIds = ArrayList<String>()

        for (like in likeSlice.content) {
            feedIds.add(like.feedId)
        }

        if (feedIds.isEmpty()) {
            return SliceImpl(ArrayList<FindFeedRespDto>(), pageable, false)
        }

        // 실제 피드 정보를 한꺼번에 조회 및 Map으로 직접 변환
        val feeds = feedRepo.findAllById(feedIds)
        val feedMap = HashMap<String, Feed>()

        for (f in feeds) {
            val fId = f.id
            if (fId != null) {
                feedMap.put(fId, f)
            }
        }

        //좋아요 내역 순서를 지키 응답 DTO 변환
        val results = ArrayList<FindFeedRespDto>()
        for (like in likeSlice.content) {
            val feedId = like.feedId
            val feed = feedMap.get(feedId)

            if (feed != null && !feed.isDeleted) {
                // 정상적인 피드 정보 조립
                val dto = FindFeedRespDto(
                    id = feed.id!!,
                    title = feed.title,
                    mainImgUrl = feed.mainImgUrl,
                    likesCount = feed.likesCount,
                    regionId = feed.regionId,
                    authorNickname = feed.authorNickname
                )
                results.add(dto)
            } else {
                // 피드가 없거나 삭제된 경우 placeholder 정보 삽입
                val deletedDto = FindFeedRespDto(
                    id = feedId,
                    title = "삭제된 게시글입니다.",
                    mainImgUrl = ArrayList<String>(),
                    likesCount = 0,
                    regionId = 0L,
                    authorNickname = "알 수 없음"
                )
                results.add(deletedDto)
            }
        }

        return SliceImpl(results, pageable, likeSlice.hasNext())
    }
}
