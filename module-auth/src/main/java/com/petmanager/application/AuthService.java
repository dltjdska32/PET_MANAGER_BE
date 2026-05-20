package com.petmanager.application;

import com.petmanager.application.event.*;
import com.petmanager.application.port.JwtPort;
import com.petmanager.application.port.OAuthPort;
import com.petmanager.application.port.OtpPort;
import com.petmanager.application.dto.*;
import com.petmanager.application.exception.AuthException;
import com.petmanager.application.port.OutboxPort;
import com.petmanager.config.GlobalConst;
import com.petmanager.domain.User;
import com.petmanager.domain.enums.Provider;
import com.petmanager.dto.BasicUserInfo;
import com.petmanager.infra.oauth.OAuth2UserInfo;
import com.petmanager.infra.jwt.JwtProvider;
import com.petmanager.infra.outbox.AuthOutbox;
import com.petmanager.infra.outbox.AuthOutboxRepo;
import com.petmanager.util.S3ImgUploader;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@Transactional(readOnly=true)
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final List<OAuthPort> oAuthPorts;
    private final UserRegionService userRegionService;
    private final JwtProvider jwtProvider;
    private final JwtPort jwtPort;
    private final OtpPort otpPort;
    private final JavaMailSender javaMailSender;
    private final OutboxPort outboxPort;
    private final EventPublisher eventPublisher;
    private final S3ImgUploader s3ImgUploader;


    /// 일반 회원로그인
    public TokenRespDto login(OriginLoginReqDto reqDto) {
        User loginUser = userService.login(reqDto);

        TokenRespDto tokenRespDto = createTokens(loginUser);

        return tokenRespDto;
    }


    public List<Long> getUserRegion(Long userId) {
        return userRegionService.findRegionIdByUserId(userId);
    }

    /// 리다이렉트 url.
    public String getRedirectUrl(Provider provider) {

        OAuthPort port = findOauthPort(provider);

        return port.getRedirectUri();
    }


    @Transactional(readOnly = false)
    public SocialLoginRespDto handleAppCallback(Provider provider, String token) {

        OAuthPort port = findOauthPort(provider);

        //  엑세스토큰을 통해 유저 정보 조회
        OAuth2UserInfo userInfo = port.getUserInfo(token);

        // oauth 유저 저장.
        SocialLoginUserInfoDto getUserInfo = userService.createOrGetOAuthUser(userInfo);

        //응답 디티오 생성
        TokenRespDto tokenRespDto = createTokens(getUserInfo.user());

        List<Long> userRegionIds = new ArrayList<>();

        if(!getUserInfo.isNewUser()) {
            userRegionIds = userRegionService.findRegionIdByUserId(getUserInfo.user().getId());
        }

        return new SocialLoginRespDto(tokenRespDto, userRegionIds, getUserInfo.isNewUser());
    }


    public TokenRespDto handleWebCallback(Provider provider, String code) {

        // code가 널일경우 인증 실패
        if (code == null) {
            throw AuthException.apiErr("인증 코드 반환 실패");
        }

        OAuthPort port = findOauthPort(provider);

        //  엑세스 토큰 반환
        String oauthToken = port.getAccessToken(code);

        //  엑세스토큰을 통해 유저 정보 조회
        OAuth2UserInfo userInfo = port.getUserInfo(oauthToken);

        // oauth 유저 저장.
        SocialLoginUserInfoDto getUserInfo = userService.createOrGetOAuthUser(userInfo);



        //응답 디티오 생성
        TokenRespDto loginRespDto = createTokens(getUserInfo.user());

        return loginRespDto;
    }

    ///  웹 및 앱 로그아웃
    public void logout(String refreshToken) {

        jwtPort.deleteRefreshToken(refreshToken);
    }



    /// 일반 유저 회원가입
    @Transactional(readOnly=false)
    public void join(CreateOriginUserDto dto) {

        User savedUser = userService.join(dto);

        /// 유저 지역 저장
        userRegionService.saveUserRegion(dto.regionIds(), savedUser);

        ///  유저지역이 저장되면 메시지 발송
        UserCreatedEvent event = UserCreatedEvent.of(savedUser, dto.regionIds());

        outboxPort.saveEvent(event);
    }

    /// 유저 지역 업서트
    @Transactional(readOnly=false)
    public void upsertUserRegions(SaveUserRegionReqDto dto, long userId) {

        User user = userService.findById(userId);
        List<Long> retVal = userRegionService.upsertUserRegions(dto, user);

        UserRegionUpsertedEvent event = new UserRegionUpsertedEvent(retVal, userId);

        outboxPort.saveEvent(event);
    }


    @Transactional(readOnly=false)
    public void updateNickname(UpsertUserNicknameReqDto dto, BasicUserInfo userInfo) {

        User user = userService.findById(userInfo.userId());

        /// 만약 현재 닉네임과 변경 닉네임이 같을 경우 종료
        if(user.getNickname().equals(dto.nickname())) {
            return;
        }

        userService.updateNickname(dto.nickname(), user.getId());

        UserNicknameUpdatedEvent event = new UserNicknameUpdatedEvent(user.getId(), dto.nickname());
        outboxPort.saveEvent(event);

    }

    ///  유저 지역 삭제
    @Transactional(readOnly=false)
    public void deleteUserRegions(DeleteUserRegionReqDto dto, Long userId) {

        User user = userService.findById(userId);

        userRegionService.deleteUserRegions(dto.deleteUserRegions(), user);

        UserRegionDeletedEvent event = new UserRegionDeletedEvent(user.getId(), dto.deleteUserRegions());
        outboxPort.saveEvent(event);
    }

    ///  토큰 재발급 (RTR)
    public TokenRespDto reissueToken(String refreshToken) {

        if (!jwtProvider.isRefreshTokenValid(refreshToken)) {
            jwtPort.deleteRefreshToken(refreshToken);
            throw AuthException.unauthorized("리프레시 토큰이 만료되었습니다. 재로그인이 필요합니다.");
        }

        Long userId = jwtPort.findUserId(refreshToken)
                .orElseThrow(() -> AuthException.unauthorized("토큰이 만료되었습니다. 재로그인이 필요합니다."));

        User user = userService.findById(userId);

        ///  refresh access 토큰 재발급
        jwtPort.deleteRefreshToken(refreshToken);

        TokenRespDto dto = TokenRespDto.of(user, jwtProvider);

        jwtPort.saveRefreshToken(userId, dto.refreshToken());

        return dto;
    }


    public void sendOtp(ValidateEmailReqDto dto) {

        OtpDto otp = OtpDto.createOtp();

        SendOtpDto sendOtpDto = new SendOtpDto(dto.email(), otp);

        /// otp 레디스에 저장. ttl 3분
        otpPort.saveOtp(dto.email(), otp.getOtp());

        /// otp 발송
        javaMailSender.send(sendOtpDto);
    }



    @Transactional(readOnly = false)
    public void upsertUserProfileImg(UpsertProfileImgReqDto dto, BasicUserInfo user) {

        // 현재 프로필 이미지의 경우 user 필드내에 반정규화 되어있음
        // 만약 프로필 이미지를 복수로 받을경우 uploadFiles()를 사용하고 DB도 정규화 필요.
        String urls = s3ImgUploader.uploadFile(dto.userProfileImgs().get(0), GlobalConst.AUTH_IMG_DIR);

        userService.upsertUserImg(user.userId(), urls);

        outboxPort.saveEvent(new UserProfileImgUpdatedEvent(user.userId(), urls));
    }

    public void validOtp(ValidateOtpDto dto) {

        boolean valid = otpPort.isValid(dto.email(), dto.otp());

        if(!valid) {
            throw AuthException.badRequest("인증 번호가 올바르지 않거나 만료되었습니다.");
        }

    }


    public UserInfoRespDto getUserInfoByUserId(Long userId) {
        UserInfoRespDto userInfoRespDto = UserInfoRespDto
                .of(userService.findById(userId), userRegionService.findRegionIdByUserId(userId));

        return userInfoRespDto;
    }

    public void checkId(String username) {
        userService.checkId(username);
    }

    private OAuthPort findOauthPort(Provider provider) {
        return oAuthPorts
                .stream()
                .filter(port -> port.supoorts(provider)).findFirst()
                .orElseThrow(() -> AuthException.serverErr("소셜 로그인 제공자 설정 오류 발생."));
    }


    public void publishEvent(DomainEvent event) {
        eventPublisher.publishEvent(event);
    }

    private TokenRespDto createTokens(User loginUser) {
        TokenRespDto tokenRespDto = TokenRespDto.of(loginUser, jwtProvider);
        //리프레시 토큰 저장.
        jwtPort.saveRefreshToken(loginUser.getId(), tokenRespDto.refreshToken());
        return tokenRespDto;
    }


    public FindUserImgRespDto findUserImgs(BasicUserInfo user) {
        return userService.findUserImgsById(user.userId());
    }
}
