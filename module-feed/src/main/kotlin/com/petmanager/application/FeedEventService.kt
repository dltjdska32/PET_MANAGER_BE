package com.petmanager.application

import com.petmanager.application.event.FeedLikeEvent
import com.petmanager.domain.FeedUser
import com.petmanager.infra.mongo.FeedLikeRepo
import com.petmanager.infra.mongo.FeedRepo
import com.petmanager.infra.mongo.FeedUserRepo
import org.slf4j.LoggerFactory
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional


@Service
@Transactional(readOnly = true)
class FeedEventService (
    private val feedUserRepo: FeedUserRepo,

    private val feedRepo: FeedRepo,
) {


    private val log = LoggerFactory.getLogger(FeedEventService::class.java)
    /**
     * 좋아요 이벤트 구독 (피드 )
     * 이벤트 퍼블리셔 사용해서 결합도를 낮춤
     */
    @EventListener
    @Transactional(readOnly = false)
    fun handleFeedLikeEvent(event: FeedLikeEvent) {
        feedRepo.updateLikesCount(event.feedId, event.count)
    }


    @Transactional(readOnly = false)
    fun createdUserEvent(feedUser: FeedUser) {
        feedUserRepo.save(feedUser)
    }

    @Transactional(readOnly = false)
    fun userRegionDeletedEvent(userId: Long, regionIds: List<Long>) {

        val foundUser = feedUserRepo.findById(userId).orElse(null)
        if (foundUser == null) {
            log.warn("[유저 지역 삭제 이벤트] 확인할 수 없는 유저 : userId={}, regionIds={}", userId, regionIds)
            return
        }

        val deleteSet = regionIds.toSet()
        val newRegionIds = foundUser.regionIds.filterNot { it in deleteSet }

        if (newRegionIds == foundUser.regionIds) {
            log.info(
                "[유저 지역 삭제 이벤트] 제거된 지역 아이디 없음 : userId={}, deletedRegionIds={}, currentRegionIds={}",
                userId,
                regionIds,
                foundUser.regionIds
            )
            return
        }

        /// feed 유저의 경우 경합상환이 없을 것이기 때문에 그냥 덮어쓰기
        feedUserRepo.save(foundUser.copy(regionIds = newRegionIds))

    }

    @Transactional(readOnly = false)
    fun userNicknameUpdatedEvent(userId: Long, nickName: String) {

        val foundUser = feedUserRepo.findById(userId).orElse(null)
        if (foundUser == null) {
            log.warn("[유저 닉네임 변경 이벤트] 확인할 수 없는 유저 : userId={}, nickname={}", userId, nickName)
            return
        }

        val updatedUser = foundUser.copy(nickname = nickName)

        feedUserRepo.save(updatedUser)
        feedRepo.updateAuthorNicknameByAuthorId(userId.toString(), nickName)
    }

    @Transactional(readOnly = false)
    fun userRegionUpsertedEvent(userId: Long, regionIds: List<Long>) {

        val foundUser = feedUserRepo.findById(userId).orElse(null)
        if (foundUser == null) {
            log.warn("[유저 지역 업서트 이벤트] 확인할 수 없는 유저 : userId={}, regionIds={}", userId, regionIds)
            return
        }

        val updatedUser = foundUser.copy(regionIds = regionIds)

        feedUserRepo.save(updatedUser)
    }

    @Transactional(readOnly = false)
    fun userProfileImgUpdatedEvent(userId: Long, userMainImgUrl: String) {

        val foundUser = feedUserRepo.findById(userId).orElse(null)
        if (foundUser == null) {
            log.warn("[유저 프로필 이미지 변경 이벤트] 확인할 수 없는 유저 : userId={}", userId)
            return
        }

        feedUserRepo.save(foundUser.copy(userMainImgUrl = userMainImgUrl))
    }



}