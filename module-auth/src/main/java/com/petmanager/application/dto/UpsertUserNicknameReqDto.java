package com.petmanager.application.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;

public record UpsertUserNicknameReqDto(@NotBlank(message = "닉네임은 필수 입니다.")
                                       @Length(min = 3, max = 16)
                                       String nickname) {
}
