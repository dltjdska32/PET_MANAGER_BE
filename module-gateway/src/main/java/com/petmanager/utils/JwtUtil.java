package com.petmanager.utils;

import com.petmanager.infra.jwt.exception.JwtException;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

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

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }


    /**
     * 토큰 유효성 검사 (게이트웨이에서 검증)
     */
    public void validateJwt(String token) {
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

    public Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}

