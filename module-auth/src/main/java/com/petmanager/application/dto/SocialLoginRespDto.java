package com.petmanager.application.dto;

import java.util.List;

public record SocialLoginRespDto(TokenRespDto tokenRespDto,
                                 List<Long> userRegions,
                                 boolean isNewUser) {
}
