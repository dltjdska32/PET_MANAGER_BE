package com.petmanager.application.event

interface EventPublisher {
    fun publish(domainEvent: DomainEvent);
}