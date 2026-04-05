package com.petmanager.application.dto;

public record SocialLoginRespDto(TokenRespDto tokenRespDto,
                                 boolean isNewUser) {
}
