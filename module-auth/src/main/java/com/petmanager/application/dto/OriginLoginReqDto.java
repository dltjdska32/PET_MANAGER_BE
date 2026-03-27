package com.petmanager.application.dto;

import jakarta.validation.constraints.NotBlank;

public record OriginLoginReqDto (@NotBlank (message = "아이디는 필수 입니다.")
                                 String username,
                                 @NotBlank (message = "패스워드는 필수 입니다.")
                                 String password) {
}
