package com.petmanager.application.event

interface DomainEvent {
     fun getEventTypeName(): String?
     fun getEventType(): EventType?
     fun feedId(): String?
}