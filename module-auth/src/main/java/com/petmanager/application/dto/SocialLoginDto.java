package com.petmanager.application.dto;

import jakarta.validation.constraints.NotBlank;

public record SocialLoginDto(@NotBlank String token) {
}
