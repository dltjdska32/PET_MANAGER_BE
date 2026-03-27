package com.petmanager.application.port;

import com.petmanager.application.event.DomainEvent;

public interface OutboxPort {

    void saveEvent(DomainEvent event);
}
