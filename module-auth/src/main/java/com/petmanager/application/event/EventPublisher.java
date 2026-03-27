package com.petmanager.application.event;

public interface EventPublisher {

    void publishEvent(DomainEvent event);
}
