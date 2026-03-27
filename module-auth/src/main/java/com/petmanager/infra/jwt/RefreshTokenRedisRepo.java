package com.petmanager.infra.jwt;

import java.util.Optional;

public interface RefreshTokenRedisRepo {

    void saveRefreshToken(Long userId, String refreshToken);

    void deleteRefreshToken(String refreshToken);

    Optional<Long> findUserId(String token);
}
