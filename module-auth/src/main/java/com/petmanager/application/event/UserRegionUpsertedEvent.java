package com.petmanager.application.event;

import java.util.List;

public record UserRegionUpsertedEvent(List<Long> userRegionIds, Long userId) implements DomainEvent {

    public String getEventTypeName() {
        return EventType.USER_REGIONS_UPSERTED.name();
    }

    public EventType getEventType() {
        return EventType.USER_REGIONS_UPSERTED;
    }
}
