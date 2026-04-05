package com.petmanager.application.dto;

import com.petmanager.domain.User;

public record SocialLoginUserInfoDto (
        User user,
        boolean isNewUser
) {

}
