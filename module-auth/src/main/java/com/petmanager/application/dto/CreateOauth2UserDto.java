package com.petmanager.application.dto;

import com.petmanager.domain.enums.Provider;
import com.petmanager.entity.Role;

public record CreateOauth2UserDto(String nickName,
                                  String username,
                                  String password,
                                  String email,
                                  Role role,
                                  Provider provider,
                                  String providerId) {
}
