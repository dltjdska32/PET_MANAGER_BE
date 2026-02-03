package com.petmanager.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.server.authorization.ServerAccessDeniedHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.io.IOException;

@Slf4j
@Component
public class JwtAccessDeniedHandler implements ServerAccessDeniedHandler {


    private final ObjectMapper objectMapper = new ObjectMapper();


    /**
     * 권한이 부족한 사용자가 특정 API에 접근했을 때 처리 (403 에러)
     */
    @Override
    public Mono<Void> handle(ServerWebExchange exchange, AccessDeniedException denied) {
        log.error("Access denied error: {}", denied.getMessage());


        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.FORBIDDEN);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        Response<Void> errResp = Response.error(
                HttpStatus.FORBIDDEN,
                "JWT_INVALID_ERR",
                "요청한 항목에 대한 권한이 없습니다."
        );

        try {
            byte[] bytes = objectMapper.writeValueAsBytes(errResp);
            DataBuffer buffer = response.bufferFactory().wrap(bytes);
            return response.writeWith(Mono.just(buffer));
        } catch (JsonProcessingException e) {
            log.error("Error writing response", e);
            return response.setComplete();
        }
    }
}