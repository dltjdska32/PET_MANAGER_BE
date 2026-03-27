package com.petmanager.application.event;

public record UserNicknameUpdatedEvent(Long userId, String nickname) implements DomainEvent {

    public String getEventTypeName() {
        return EventType.USER_NICKNAME_UPDATED.name();
    }

    public EventType getEventType() {
        return EventType.USER_NICKNAME_UPDATED;
    }
}
