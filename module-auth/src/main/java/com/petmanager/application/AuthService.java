package com.petmanager.application;

import com.petmanager.application.port.JwtPort;
import com.petmanager.application.port.OAuthPort;
import com.petmanager.application.port.OtpPort;
import com.petmanager.application.dto.*;
import com.petmanager.application.exception.AuthException;
import com.petmanager.domain.User;
import com.petmanager.domain.enums.Provider;
import com.petmanager.infra.oauth.OAuth2UserInfo;
import com.petmanager.infra.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;


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

    /// 일반 회원로그인
    public TokenRespDto login(OriginLoginReqDto reqDto) {
        User loginUser = userService.login(reqDto);

        TokenRespDto tokenRespDto = createTokens(loginUser);

        return tokenRespDto;
    }


    public void getUserRegion(Long userId) {
        userRegionService.findRegionIdByUserId(userId);
    }

    /// 리다이렉트 url.
    public String getRedirectUrl(Provider provider) {

        OAuthPort port = findOauthPort(provider);

        return port.getRedirectUri();
    }


    @Transactional(readOnly = false)
    public TokenRespDto handleAppCallback(Provider provider, String token) {

        OAuthPort port = findOauthPort(provider);

        //  엑세스토큰을 통해 유저 정보 조회
        OAuth2UserInfo userInfo = port.getUserInfo(token);

        // oauth 유저 저장.
        User user = userService.createOrGetOAuthUser(userInfo);

        //응답 디티오 생성
        TokenRespDto loginRespDto = createTokens(user);

        return loginRespDto;
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
        User user = userService.createOrGetOAuthUser(userInfo);

        //응답 디티오 생성
        TokenRespDto loginRespDto = createTokens(user);

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

    }

    /// 유저 지역 업서트
    @Transactional(readOnly=false)
    public void upsertUserRegions(SaveUserRegionReqDto dto, long userId) {
        User user = userService.findById(userId);
        userRegionService.upsertUserRegions(dto, user);
    }


    ///  유저 지역 삭제
    @Transactional(readOnly=false)
    public void deleteUserRegions(DeleteUserRegionReqDto dto, Long userId) {

        User user = userService.findById(userId);

        userRegionService.deleteUserRegions(dto.deleteUserRegions(), user);
    }

    ///  토큰 재발급.
    public TokenRespDto reissueToken(String refreshToken) {

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


    private TokenRespDto createTokens(User loginUser) {
        TokenRespDto tokenRespDto = TokenRespDto.of(loginUser, jwtProvider);
        //리프레시 토큰 저장.
        jwtPort.saveRefreshToken(loginUser.getId(), tokenRespDto.refreshToken());
        return tokenRespDto;
    }


}
