package com.petmanager.config;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


/// webFlux 예외 핸들러는 Json 응답을 직접 만들어야함.
@Configuration
public class ObjectMapperConfig {

    @Bean
    public ObjectMapper objectMapper() {

        ObjectMapper om = new ObjectMapper();

        ///  오브젝트 매퍼에 날짜 시간 모듈등록
        om.registerModule(new JavaTimeModule());

        ///  타임스탬프 사용 x
        ///  사용시  "timestamp": 1738587045000 밀리초 형태
        ///  사용x   "timestamp": "2026-02-03T14:30:45" 형태
        om.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        return om;
    }
}
