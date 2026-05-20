package com.petmanager.application.event;

import com.petmanager.domain.User;
import com.petmanager.entity.Role;
import lombok.Builder;

import java.util.List;

@Builder
public record UserCreatedEvent(Long userId,
        String username,
        String email,
        String nickname,
        Role role,
        String userMainImgUrl,
        List<Long> regionIds) implements DomainEvent {

    public static UserCreatedEvent of(User user, List<Long> regionIds) {
        return UserCreatedEvent.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .role(user.getRole())
                .userMainImgUrl(user.getUserMainImgUrl())
                .regionIds(regionIds)
                .build();
    }

    public String getEventTypeName() {
        return EventType.USER_CREATED.name();
    }

    public EventType getEventType() {
        return EventType.USER_CREATED;
    }
}
