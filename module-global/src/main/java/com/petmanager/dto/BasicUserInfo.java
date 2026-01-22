package com.petmanager.dto;

import com.petmanager.entity.Role;

public record BasicUserInfo(Long userId,
                            String username,
                            String email,
                            Role role)  {
}
