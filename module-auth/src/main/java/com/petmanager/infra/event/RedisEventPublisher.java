package com.petmanager.infra.event;

import com.petmanager.application.event.DomainEvent;
import com.petmanager.application.event.EventPublisher;
import com.petmanager.config.GlobalConst;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisEventPublisher implements EventPublisher {

    private final ObjectMapper obm;
    private final StringRedisTemplate srt;

    @Override
    public void publishEvent(DomainEvent event) {
        try {
            String value = obm.writeValueAsString(event);

            Map<String, String> map = new HashMap<>();
            map.put("eventType", event.getEventTypeName());
            map.put("value", value);

            srt.opsForStream().add(GlobalConst.AUTH_STREAM_KEY, map);
        } catch (Exception e) {
            log.error("이벤트 발행 실패 레디스 스트림 전송 에러. userId: {}", event.userId(), e);
        }
    }
}
