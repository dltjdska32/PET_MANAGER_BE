package com.petmanager.ui;



import com.petmanager.application.AuthService;
import com.petmanager.application.dto.*;
import com.petmanager.application.exception.AuthException;
import com.petmanager.config.Response;
import com.petmanager.domain.enums.Provider;
import com.petmanager.dto.BasicUserInfo;
import com.petmanager.infra.jwt.JwtProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Arrays;

import static com.petmanager.config.GlobalConst.REFRESH_TOKEN_COOKIE_KEY;


@RestController
@RequiredArgsConstructor
@Tag(name = "AUTH-API", description = "인증/인가 관련 API 엔드포인트")
public class AuthController {

    private final AuthService authService;
    private final JwtProvider jwtProvider;

    /// 기본 회원 로그인
    @PostMapping("/login")
    public Response<TokenRespDto> login(@RequestBody OriginLoginReqDto reqDto) {

        authService.login(reqDto);

        return Response.ok();
    }

    /// 기본회원가입
    @PostMapping("/join")
    public Response<Void> join(@RequestBody CreateOriginUserDto dto) {

        authService.join(dto);
        return Response.ok();
    }


    /// 기본로그인시 이메일인증 요청
    @Operation(
            summary = "유저 이메일 인증 요청",
            description = "유저 이메일 인증 요청 : 유저에게 6자리 난수 발송."
    )
    @PostMapping("/email/otp/send")
    public Response<Void> sendEmail(@RequestBody @Valid ValidateEmailReqDto dto) {

        authService.sendOtp(dto);
        return Response.ok();
    }

    /// 기본로그인시 이메일 검증
    @Operation(
            summary = "유저 이메일 검증",
            description = "유저 이메일 검증 : 유저에게 발송된 난수 확인."
    )
    @PostMapping("/email/otp")
    public Response<Void> validEmail(@RequestBody @Valid ValidateOtpDto dto) {

        authService.validOtp(dto);
        return Response.ok();
    }



    /// 유저 지역 설정
    @Operation(
            summary = "유저 지역 설정 (삽입, 수정)",
            description = "유저 지역 설정 (삽입, 수정)"
    )
    @PutMapping("/user/region")
    @PreAuthorize("hasRole('USER')")
    public Response<Void> upsertUserRegions (@RequestBody @Valid SaveUserRegionReqDto dto,
                                             @AuthenticationPrincipal BasicUserInfo user) {

        authService.upsertUserRegions(dto, user.userId());

        return Response.ok();
    }


    @Operation(
            summary = "유저 설정 지역 삭제",
            description = "유저 설정 지역 삭제"
    )
    @DeleteMapping("/user/region")
    @PreAuthorize("hasRole('USER')")
    public Response<Void> deleteUserRegions(@RequestBody @Valid DeleteUserRegionReqDto dto,
                                            @AuthenticationPrincipal BasicUserInfo user) {



        authService.deleteUserRegions(dto, user.userId());

        return  Response.ok();
    }


    ///  소셜로그인
    @Operation(
            summary = "소셜로그인 리다이렉트 url반환",
            description = "소셜로그인 리다이렉트 url반환 "
    )
    @GetMapping("/login/{provider}")
    public Response<String> getOAuthRedirectURL(@PathVariable(name = "provider") Provider provider) {

        String redirectUrl = authService.getRedirectUrl(provider);

        return Response.ok(HttpStatus.FOUND, redirectUrl);
    }


    ///  웹 소셜 로그인 콜백
    @Operation(
            summary = "웹 전용 소셜로그인 콜백",
            description = "웹 전용 소셜로그인 콜백 "
    )
    @GetMapping("/login/{provider}/callback")
    public void webCallback(@PathVariable Provider provider,
                                              @RequestParam String code,
                                              HttpServletResponse res) throws IOException {



        TokenRespDto dto = authService.handleWebCallback(provider, code);

        jwtProvider.saveRefreshTokenToCookie(res, dto.refreshToken());

        /// 엑세스 토큰 쿼리 파람에 담아줌
        String redirectUrl = "http://localhost:3000/oauth/callback?token=" + dto.accessToken();

        /// 리디렉션
        res.sendRedirect(redirectUrl);
    }



    /// 앱 소셜 로그인 콜백
    @Operation(
              summary = "앱 전용 소셜로그인 콜백",
              description = "앱 전용 소셜로그인 콜백 "
      )
    @PostMapping("/login/{provider}/callback")
    public Response<TokenRespDto> appCallback(@PathVariable Provider provider,
                                              @RequestParam @Valid SocialLoginDto reqDto) {

        TokenRespDto respDto = authService.handleAppCallback(provider, reqDto.token());

        return Response.ok(respDto);
    }


    @Operation(
            summary = "로그아웃",
            description = "로그아웃 "
    )
    @PostMapping("/logout")
    @PreAuthorize("hasRole('USER')")
    public Response<String> logout(HttpServletRequest req,
                                   HttpServletResponse res,
                                   @RequestBody @Valid RefreshReqDto dto) {


        String refreshToken = findRefreshToken(req, dto);

        ///  레디스에서 제거
        authService.logout(refreshToken);
        /// 쿠키에서 제거.
        jwtProvider.deleteRefreshTokenFromCookie(res);

        return Response.ok("로그아웃을 완료 했습니다.");
    }



    @Operation(
            summary = "앱 토큰 재발급 API",
            description = "쿠키, 헤더, 바디에 담긴 리프레시 토큰으로 엑세스 토큰, 리프레시 토큰을 재발급. (RTR 방식)"
    )
    @PostMapping("/reissue")
    public Response<TokenRespDto> reissueToken(@RequestBody RefreshReqDto dto) {

        TokenRespDto retVal = authService.reissueToken(dto.refreshToken());

        return Response.ok(retVal);
    }




    ///  웹 또는 앱 별로 리프레시토큰 찾는 로직
    private static String findRefreshToken(HttpServletRequest req, RefreshReqDto dto) {
        String refreshToken = null;

        if (dto.refreshToken() != null
                && !dto.refreshToken().isBlank()) {                         /// 바디에 담겨져 올경우    -> 네이티브 앱

            refreshToken = dto.refreshToken();

        } else if (req.getHeader(REFRESH_TOKEN_COOKIE_KEY) != null
                && !req.getHeader(REFRESH_TOKEN_COOKIE_KEY).isBlank()) {        ///  헤더에 담겨져 올경우  -> 네이티브 앱

            refreshToken = req.getHeader(REFRESH_TOKEN_COOKIE_KEY);

        } else {                                                            ///  쿠키에 담겨져 올경우 -> 웹

            Cookie[] cookies = req.getCookies();

            if (cookies == null) {
                throw AuthException.badRequest("토큰을 확인 할 수 없습니다.");
            }

            Cookie first = Arrays.stream(req.getCookies())
                    .filter(cookie -> cookie.getName().equals(REFRESH_TOKEN_COOKIE_KEY))
                    .findFirst()
                    .orElseThrow(() -> AuthException.badRequest("토큰을 확인 할 수 없습니다."));

            refreshToken = first.getValue();

        }

        if(refreshToken == null || refreshToken.isBlank()) {
            throw AuthException.badRequest("토큰을 확인 할 수 없습니다.");
        }
        return refreshToken;
    }



}

