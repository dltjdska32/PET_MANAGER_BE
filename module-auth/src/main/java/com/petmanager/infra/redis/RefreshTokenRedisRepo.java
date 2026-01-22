package com.petmanager.infra.redis;

import java.util.Optional;

public interface RefreshTokenRedisRepo {

    void saveRefreshToken(Long userId, String refreshToken);

    void deleteRefreshToken(String refreshToken);

    Optional<Long> findUserId(String token);
}
