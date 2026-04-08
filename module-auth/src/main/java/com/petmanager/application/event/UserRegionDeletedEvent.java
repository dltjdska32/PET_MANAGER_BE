package com.petmanager.application.event;

import java.util.List;

public record UserRegionDeletedEvent(Long userId,
                                     List<Long> deletedRegionIds) implements DomainEvent {

    public String getEventTypeName() {
        return EventType.USER_REGION_DELETED.name();
    }

    public EventType getEventType() {
        return EventType.USER_REGION_DELETED;
    }
}
