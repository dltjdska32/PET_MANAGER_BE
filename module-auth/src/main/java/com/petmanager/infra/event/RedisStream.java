package com.petmanager.infra.event;

import com.petmanager.application.event.DomainEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import java.util.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.petmanager.application.event.EventPublisher;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisStream implements EventPublisher {

    private final ObjectMapper obm;
    private final StringRedisTemplate srt;

    /// 스트림 방이름 - auth서버에서 발행한 이벤트
    private static final String STREAM_KEY = "auth-events";

    @Override
    public void publishEvent(DomainEvent event) {
        try {
            String value = obm.writeValueAsString(event);

            Map<String, String> map = new HashMap<>();
            map.put("eventType", event.getEventTypeName());
            map.put("value", value);

            srt.opsForStream().add(STREAM_KEY, map);
        } catch (Exception e) {
            log.error("이벤트 발행 실패 레디스 스트림 전송 에러. userId: {}", event.userId(), e);
        }
    }
}
