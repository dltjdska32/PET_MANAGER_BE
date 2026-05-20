package com.petmanager.application.event;

public record UserProfileImgUpdatedEvent(Long userId, String userMainImgUrl) implements DomainEvent {

    public String getEventTypeName() {
        return EventType.USER_PROFILE_IMG_UPDATED.name();
    }

    public EventType getEventType() {
        return EventType.USER_PROFILE_IMG_UPDATED;
    }
}
