package com.petmanager.application

import com.petmanager.application.dto.FindFeedReqDto
import com.petmanager.application.dto.FindFeedRespDto
import com.petmanager.application.dto.UpsertFeedReqDto
import com.petmanager.application.event.FeedLikeEvent
import com.petmanager.application.exception.FeedException
import com.petmanager.config.GlobalConst
import com.petmanager.domain.Feed
import com.petmanager.dto.BasicUserInfo
import com.petmanager.infra.mongo.FeedRepo
import com.petmanager.util.S3ImgUploader
import org.springframework.context.event.EventListener
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Slice
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class FeedService(
    private val feedRepo: FeedRepo,
    private val s3ImgUploader: S3ImgUploader
) {

    /**
     * 좋아요 이벤트 구독 (피드 )
     * 이벤트 퍼블리셔 사용해서 결합도를 낮춤
     */
    @EventListener
    fun handleFeedLikeEvent(event: FeedLikeEvent) {
        feedRepo.updateLikesCount(event.feedId, event.count)
    }

    /**
     * 피드 삭제
     */
    @Transactional(readOnly = false)
    fun deleteFeed(id: String, user: BasicUserInfo) {
        val feed = feedRepo.findById(id).orElseThrow {
            FeedException.notFound("해당 피드를 찾을 수 없습니다.")
        }

        if (feed.isDeleted) {
            throw FeedException.notFound("이미 삭제된 피드입니다.")
        }

        if (feed.authorId != user.userId.toString()) {
            throw FeedException.forbidden("본인의 피드만 삭제할 수 있습니다.")
        }

        feed.delete()
        feedRepo.save(feed)
    }

    /**
     * 피드 업서트
     */
    @Transactional(readOnly = false)
    fun upsertFeed(req: UpsertFeedReqDto, user: BasicUserInfo) {
        if (req.feedId == null) {
            createFeed(req, user)
        } else {
            updateFeed(req, user)
        }
    }

    /**
     * 피드 신규 생성
     */
    @Transactional(readOnly = false)
    fun createFeed(req: UpsertFeedReqDto, user: BasicUserInfo) {
        // 검색용 토큰 생성
        val tokens = Feed.generateTokens(req.title)

        // 이미지 저장
        val savedMainImgs = s3ImgUploader.uploadFiles(req.mainImgs, GlobalConst.FEED_IMG_DIR)
        val savedSideImgs = s3ImgUploader.uploadFiles(req.sideImgs, GlobalConst.FEED_IMG_DIR)

        val feed = Feed.of(
            authorId = user.userId.toString(),
            authorName = user.username() ?: throw FeedException.badRequest("유저 이름이 유효하지 않습니다."),
            authorNickname = req.userNickname ?: throw FeedException.badRequest("닉네임은 필수입니다."),
            title = req.title,
            description = req.description,
            regionId = req.regionId ?: throw FeedException.badRequest("지역 아이디는 필수입니다."),
            mainImgUrl = savedMainImgs,
            sideImgUrl = savedSideImgs,
            searchTokens = tokens,
            pay = req.pay,
            startDate = req.startDate,
            endDate = req.endDate,
            feedType = req.feedType
        )

        feedRepo.save(feed)
    }

    /**
     * 피드 수정
     */
    @Transactional(readOnly = false)
    fun updateFeed(req: UpsertFeedReqDto, user: BasicUserInfo) {
        val feed = feedRepo.findById(req.feedId!!).orElseThrow {
            FeedException.notFound("수정할 피드를 찾을 수 없습니다.")
        }

        // 본인 확인
        if (feed.authorId != user.userId.toString()) {
            throw FeedException.forbidden("본인의 피드만 수정할 수 있습니다.")
        }

        if (feed.isDeleted) {
            throw FeedException.notFound("이미 삭제된 피드는 수정할 수 없습니다.")
        }

        // 기존 이미지 URL 백업
        val oldImgs = feed.mainImgUrl + feed.sideImgUrl

        // 신규 업로드 및 토큰 생성
        val tokens = Feed.generateTokens(req.title)
        val savedMainImgs = s3ImgUploader.uploadFiles(req.mainImgs, GlobalConst.FEED_IMG_DIR)
        val savedSideImgs = s3ImgUploader.uploadFiles(req.sideImgs, GlobalConst.FEED_IMG_DIR)

        feed.update(
            title = req.title,
            description = req.description,
            regionId = req.regionId ?: throw FeedException.badRequest("지역 정보는 필수입니다."),
            mainImgUrl = savedMainImgs,
            sideImgUrl = savedSideImgs,
            pay = req.pay,
            startDate = req.startDate,
            endDate = req.endDate,
            feedType = req.feedType,
            searchTokens = tokens
        )

        feedRepo.save(feed)

        // S3 기존 파일 정리
        s3ImgUploader.deleteFiles(oldImgs)
    }

    /**
     * 피드 전체 조회
     */
    fun findFeed(pageable: Pageable, req: FindFeedReqDto): Slice<FindFeedRespDto> {
        return feedRepo.findFeed(pageable, req)
    }

    /**
     * 피드 상세 조회
     */
    fun findFeedById(id: String): Feed {
        val feed = feedRepo.findById(id).orElseThrow {
            FeedException.notFound("해당 피드를 찾을 수 없습니다.")
        }

        if (feed.isDeleted) {
            throw FeedException.notFound("이미 삭제된 피드입니다.")
        }

        return feed
    }
}