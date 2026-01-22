package com.petmanager.application;

import com.petmanager.application.adapter.JwtAdapter;
import com.petmanager.application.adapter.OAuthAdapter;
import com.petmanager.application.adapter.OtpAdapter;
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
    private final List<OAuthAdapter> oAuthAdapters;
    private final UserRegionService userRegionService;
    private final JwtProvider jwtProvider;
    private final JwtAdapter jwtAdapter;
    private final OtpAdapter otpAdapter;
    private final JavaMailSender javaMailSender;

    /// 일반 회원로그인
    public TokenRespDto login(OriginLoginReqDto reqDto) {
        User loginUser = userService.login(reqDto);

        TokenRespDto tokenRespDto = createTokens(loginUser);

        return tokenRespDto;
    }



    /// 리다이렉트 url.
    public String getRedirectUrl(Provider provider) {

        OAuthAdapter adapter = findOauthAdapter(provider);

        return adapter.getRedirectUri();
    }


    public TokenRespDto handleAppCallback(Provider provider, String token) {

        OAuthAdapter adapter = findOauthAdapter(provider);

        //  엑세스토큰을 통해 유저 정보 조회
        OAuth2UserInfo userInfo = adapter.getUserInfo(token);

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

        OAuthAdapter adapter = findOauthAdapter(provider);

        //  엑세스 토큰 반환
        String oauthToken = adapter.getAccessToken(code);

        //  엑세스토큰을 통해 유저 정보 조회
        OAuth2UserInfo userInfo = adapter.getUserInfo(oauthToken);

        // oauth 유저 저장.
        User user = userService.createOrGetOAuthUser(userInfo);

        //응답 디티오 생성
        TokenRespDto loginRespDto = createTokens(user);

        return loginRespDto;
    }

    ///  웹 및 앱 로그아웃
    public void logout(String refreshToken) {

        jwtAdapter.deleteRefreshToken(refreshToken);
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

        Long userId = jwtAdapter.findUserId(refreshToken)
                .orElseThrow(() -> AuthException.unauthorized("토큰이 만료되었습니다. 재로그인이 필요합니다."));

        User user = userService.findById(userId);

        ///  refresh access 토큰 재발급
        jwtAdapter.deleteRefreshToken(refreshToken);

        TokenRespDto dto = TokenRespDto.of(user, jwtProvider);

        jwtAdapter.saveRefreshToken(userId, dto.refreshToken());

        return dto;
    }


    public void sendOtp(ValidateEmailReqDto dto) {

        OtpDto otp = OtpDto.createOtp();

        SendOtpDto sendOtpDto = new SendOtpDto(dto.email(), otp);

        /// otp 발송
        javaMailSender.send(sendOtpDto);
    }


    public void validOtp(ValidateOtpDto dto) {

    }


    /// 어뎁터 확인.
    private OAuthAdapter findOauthAdapter(Provider provider) {
        return oAuthAdapters
                .stream()
                .filter(auth -> auth.supoorts(provider)).findFirst()
                .orElseThrow(() -> AuthException.serverErr("소셜 로그인 제공자 설정 오류 발생."));
    }


    private TokenRespDto createTokens(User loginUser) {
        TokenRespDto tokenRespDto = TokenRespDto.of(loginUser, jwtProvider);
        //리프레시 토큰 저장.
        jwtAdapter.saveRefreshToken(loginUser.getId(), tokenRespDto.refreshToken());
        return tokenRespDto;
    }




}
