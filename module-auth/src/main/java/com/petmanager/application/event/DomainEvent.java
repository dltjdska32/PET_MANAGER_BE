package com.petmanager.application.event;

public interface DomainEvent {
    String getEventTypeName();
    EventType getEventType();
    Long userId();
}
