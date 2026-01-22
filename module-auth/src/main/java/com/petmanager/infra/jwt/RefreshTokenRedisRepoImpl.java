package com.petmanager.infra.jwt;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;
import java.util.Optional;

import static com.petmanager.config.GlobalConst.TOKEN_PREFIX;

@Repository
@RequiredArgsConstructor
public class RefreshTokenRedisRepoImpl implements RefreshTokenRedisRepo {

    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${jwt.refresh-expiration}")
    private Long refreshExpiration;


    @Override
    public void saveRefreshToken(Long userId, String refreshToken) {
        String key = createKey(refreshToken);

        redisTemplate.opsForValue().set(key, userId, Duration.ofSeconds(refreshExpiration));
    }



    @Override
    public void deleteRefreshToken(String refreshToken) {
        String key = createKey(refreshToken);

        redisTemplate.delete(key);
    }

    @Override
    public Optional<Long> findUserId(String token) {

        String key = createKey(token);
        String userId = (String) redisTemplate.opsForValue().get(key);

        return Optional.ofNullable(userId)
                .map(Long::valueOf);
    }



    private String createKey(String refreshToken) {

        return TOKEN_PREFIX + refreshToken;
    }
}
