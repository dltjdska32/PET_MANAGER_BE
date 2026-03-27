package com.petmanager.application.event;

import com.petmanager.domain.User;
import lombok.Builder;

import java.util.List;

@Builder
public record UserCreatedEvent(Long userId,
        String email,
        String nickname,
        List<Long> regionIds) implements DomainEvent {

    public static UserCreatedEvent of(User user,List<Long> regionIds) {
        return UserCreatedEvent.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
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
