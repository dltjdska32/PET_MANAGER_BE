package com.petmanager.utils;


import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import com.petmanager.exception.JwtException;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.function.Function;

import static com.petmanager.config.GlobalConst.*;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    private SecretKey secretKey;

    @PostConstruct
    public void init() {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        secretKey = Keys.hmacShaKeyFor(bytes);
    }

//    public boolean validateToken(String token) {
//        try {
//            Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token);
//            return true;
//        } catch (Exception e) {
//            return false;
//        }
//    }

    /**
     * 토큰 유효성 검사 (게이트웨이에서 검증)
     */
    public void validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token);
        } catch (SecurityException | MalformedJwtException e) {
            throw JwtException.jwtInvalidMalformedEx("잘못된 JWT 서명입니다.");
        } catch (ExpiredJwtException e) {
            throw JwtException.jwtExpiredEx("만료된 JWT 토큰입니다.");
        } catch (UnsupportedJwtException e) {
            throw JwtException.jwtUnsupportedEx("지원되지 않는 JWT 토큰입니다.");
        } catch (IllegalArgumentException e) {
            throw JwtException.jwtClaimEmptyEx("JWT 토큰이 잘못되었습니다.");
        } catch (Exception e) {
            throw JwtException.jwtInvalidEx("유효하지 않은 JWT 토큰입니다.");
        }
    }


    /**
     * Token Claims 가져오기
     */
    public Claims getClaims(String token) {

        validateToken(token);

        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }


    /// 유저ID 확인
    public Long getUserId(String token){

        Claims claims = getClaims(token);

        String userId = claims.getSubject();

        if(userId == null){
            throw JwtException.jwtClaimEmptyEx("JWT 유저 정보를 확인할 수 없음.");
        }

        return Long.parseLong(userId);
    }


    /// 유저롤 확인
    public String getUserRole(String token){

        Claims claims = getClaims(token);
        String userRole = claims.get(JWT_CLAIM_ROLE, String.class);

        if(userRole == null){
            throw JwtException.jwtClaimEmptyEx("JWT 유저 정보를 확인할 수 없음.");
        }

        return userRole;
    }


    /// 유저email 확인
    public String getUserEmail(String token){

        Claims claims = getClaims(token);
        String userEmail = claims.get(JWT_CLAIM_EMAIL, String.class);

        if(userEmail == null){
            throw JwtException.jwtClaimEmptyEx("JWT 유저 정보를 확인할 수 없음.");
        }

        return userEmail;
    }

    /// 유저네임 확인
    public String getUsername(String token){

        Claims claims = getClaims(token);
        String username = claims.get(JWT_CLAIM_USERNAME, String.class);

        if(username == null){
            throw JwtException.jwtClaimEmptyEx("JWT 유저 정보를 확인할 수 없음.");
        }

        return username;
    }
}

