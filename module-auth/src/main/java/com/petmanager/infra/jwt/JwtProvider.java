package com.petmanager.infra.jwt;




import com.petmanager.entity.Role;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;

import static com.petmanager.config.GlobalConst.*;


/// MVC전용
/// 검증은 api 게이트웨이에서 진행하기 때문에 검증은 사용하지 않음.
/// 앱전용 서버일 경우 쿠키에 리프레시 토큰을 담아주는 메서드 사용하지않음.
@Component
public class JwtProvider {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-expiration}")
    private Long accessExpiration;

    @Value("${jwt.refresh-expiration}")
    private Long refreshExpiration;

    private SecretKey secretKey;

    @PostConstruct
    public void init() {
        initializeSecretKey();
    }

    /// 개인키 생성.
    /// byte의 크기에 따라 암호화 알고리즘 결정.
    private void initializeSecretKey() {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        secretKey = Keys.hmacShaKeyFor(bytes);
    }

    /**
     * accessToken 생성
     */
    public String createAccessToken(Long userId, String userName, String email, Role role) {
        long now = System.currentTimeMillis();
        Date accessTokenExpiration = new Date(now + accessExpiration);

        return Jwts.builder()
                .subject(userId.toString())
                .claim(JWT_CLAIM_ROLE, role)            // 사용자 정의 클레임
                .claim(JWT_CLAIM_USERNAME, userName)    // 사용자 정의 클레임
                .claim(JWT_CLAIM_EMAIL, email)          // 사용자 정의 클레임
                .issuedAt(new Date(now))
                .expiration(accessTokenExpiration)
                .signWith(secretKey)
                .compact();
    }

    /**
     * refreshToken 생성
     */
    public String createRefreshToken(Long memberId) {
        long now = System.currentTimeMillis();
        Date refreshTokenExpiration = new Date(now + refreshExpiration);

        return Jwts.builder()
                .subject(memberId.toString())
                .issuedAt(new Date(now))
                .expiration(refreshTokenExpiration)
                .signWith(secretKey)
                .compact();
    }

    /**
     * 토큰 유효성 검사 (게이트웨이에서 검증)
     */
//    public void validateJwt(String token) {
//        try {
//            Jwts.parser()
//                    .verifyWith(secretKey)
//                    .build()
//                    .parseSignedClaims(token);
//        } catch (SecurityException | MalformedJwtException e) {
//            throw JwtException.jwtInvalidMalformedEx("잘못된 JWT 서명입니다.");
//        } catch (ExpiredJwtException e) {
//            throw JwtException.jwtExpiredEx("만료된 JWT 토큰입니다.");
//        } catch (UnsupportedJwtException e) {
//            throw JwtException.jwtUnsupportedEx("지원되지 않는 JWT 토큰입니다.");
//        } catch (IllegalArgumentException e) {
//            throw JwtException.jwtClaimEmptyEx("JWT 토큰이 잘못되었습니다.");
//        } catch (Exception e) {
//            throw JwtException.jwtInvalidEx("유효하지 않은 JWT 토큰입니다.");
//        }
//    }

    /**
     * refreshToken을 쿠키에 저장 - 앱일경우 사용 x
     */
    public void saveRefreshTokenToCookie(HttpServletResponse response, String refreshToken) {
        Cookie cookie = new Cookie(REFRESH_TOKEN_COOKIE_KEY, refreshToken);
        cookie.setHttpOnly(true);                                       // httpOnly 설정 - js 접근 불가
        cookie.setSecure(false);                                        // https 강제  -  개발 : false , 배포 -true
        cookie.setPath("/");                                            // 모든 경로에 쿠키포함.
        cookie.setMaxAge(Math.toIntExact(refreshExpiration / 1000));    //쿠키 만료 시간
        response.addCookie(cookie);

    }

    /**
     * 쿠키에서 refreshToken 삭제 - 앱일경우 사용 x
     */
    public void deleteRefreshTokenFromCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(REFRESH_TOKEN_COOKIE_KEY, null);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }


    /// -> api 게이트웨이에서 헤더로 각각의 서버에 담아서 보내줄예정
//    /**
//     * memberId 반환
//     */
//    public Long getUserId() {
//        Authentication authentication = getAuthentication();
//        if (authentication == null) {
//            throw JwtException.notFoundEx("JWT 유저 정보를 확인할 수 없음.");
//        }
//        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
//            if (jwtAuth.getPrincipal() == null) {
//                throw JwtException.notFoundEx("JWT 유저 정보를 확인할 수 없음.");
//            }
//            return (Long) jwtAuth.getPrincipal();
//        }
//        throw JwtException.notFoundEx("JWT 유저 정보를 확인할 수 없음.");
//    }

//    /**
//     * userName 반환
//     */
//    public String getUsername() {
//        Object username = getClaims(JWT_CLAIM_USERNAME);
//        if (username == null) {
//            throw JwtException.notFoundEx("JWT 유저 정보를 확인할 수 없음.");
//        }
//        return username.toString();
//    }


//    /**
//     * email 반환
//     */
//    public String getUserEmail() {
//        Object authorities = getClaims(JWT_CLAIM_EMAIL);
//        if (authorities == null) {
//            throw JwtException.notFoundEx("JWT 유저 정보를 확인할 수 없음.");
//        }
//        return (String) authorities;
//    }

//    /**
//     * memberRole 반환
//     */
//    public Role getUserRole() {
//        Object authorities = getClaims(JWT_CLAIM_ROLE);
//        if (authorities == null) {
//            throw JwtException.notFoundEx("JWT 유저 정보를 확인할 수 없음.");
//        }
//        return Role.valueOf(authorities.toString());
//    }

    /**
     * (제너릭 타입) token을 이용해 claims value 가져오기
     */
    public <T> T getClaims(String token, Function<Claims, T> func) {
        Claims claims = getClaimsFromToken(token);
        return func.apply(claims);
    }

    /**
     * (제너릭 타입) claims을 이용해 claims value 가져오기
     */
    public <T> T getClaims(Claims claims, Function<Claims, T> func) {
        return func.apply(claims);
    }

    /**
     * Token Claims 가져오기
     */
    public Claims getClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private Authentication getAuthentication() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        return authentication;
    }

}
