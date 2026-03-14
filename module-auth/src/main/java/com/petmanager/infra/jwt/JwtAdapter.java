package com.petmanager.infra.jwt;

import com.petmanager.application.port.JwtPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@RequiredArgsConstructor
@Component
public class JwtAdapter implements JwtPort {

    private final RefreshTokenRedisRepo refreshTokenRedisRepo;

    @Override
    public void saveRefreshToken(Long userId, String refreshToken) {
        refreshTokenRedisRepo.saveRefreshToken(userId, refreshToken);
    }

    @Override
    public void deleteRefreshToken(String refreshToken) {
        refreshTokenRedisRepo.deleteRefreshToken(refreshToken);
    }

    @Override
    public Optional<Long> findUserId(String refreshToken) {
        return refreshTokenRedisRepo.findUserId(refreshToken);
    }
}
