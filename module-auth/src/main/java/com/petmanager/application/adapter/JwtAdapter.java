package com.petmanager.application.adapter;

import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public interface JwtAdapter {

    void saveRefreshToken(Long userId, String refreshToken);

    void deleteRefreshToken(String refreshToken);

    Optional<Long> findUserId(String refreshToken);
}
