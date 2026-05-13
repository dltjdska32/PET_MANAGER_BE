package com.petmanager.application.dto;

import com.petmanager.domain.User;
import lombok.Builder;

import java.util.List;

public record UserInfoRespDto(String nickName,
        String email,
        String userMainImgUrl,
        List<Long> regionIds) {

    public static UserInfoRespDto of(User user, List<Long> reionIds) {

        return new UserInfoRespDto(user.getNickname(),
                user.getEmail(),
                user.getUserMainImgUrl(),
                reionIds);
    }
}
