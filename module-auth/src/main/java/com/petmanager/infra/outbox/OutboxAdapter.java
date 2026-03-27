package com.petmanager.infra.outbox;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.petmanager.application.event.DomainEvent;
import com.petmanager.application.port.OutboxPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxAdapter implements OutboxPort {

    private final AuthOutboxRepo authOutboxRepo;
    private final ObjectMapper obm;

    @Override
    public void saveEvent(DomainEvent event) {
        try{
            String eventValue = obm.writeValueAsString(event);
            AuthOutbox box = AuthOutbox.from(event.getEventType(), eventValue);
            authOutboxRepo.save(box);
        } catch (Exception e) {
            log.error("[saveEvent] 아웃박스 저장 (직렬화) 실패 userId : {} ", event.userId(), e);
        }
    }
}
