package com.petmanager.application.port;

import java.util.Optional;

public interface JwtPort {

    void saveRefreshToken(Long userId, String refreshToken);

    void deleteRefreshToken(String refreshToken);

    Optional<Long> findUserId(String refreshToken);
}
