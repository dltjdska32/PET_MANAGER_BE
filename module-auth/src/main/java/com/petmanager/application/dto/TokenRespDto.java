package com.petmanager.application.dto;

import com.petmanager.domain.User;
import com.petmanager.infra.jwt.JwtProvider;

public record TokenRespDto (String accessToken,
                            String refreshToken){

    public static TokenRespDto of (User user, JwtProvider jwtProvider){

        /// refresh, accesstoken생성
        String accessToken = jwtProvider.createAccessToken(user.getId(), user.getUsername(), user.getEmail(), user.getRole());
        String refreshToken = jwtProvider.createRefreshToken(user.getId());

        return new TokenRespDto(accessToken, refreshToken);
    }
}
