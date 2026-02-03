package com.petmanager.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.server.ServerAuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;


@Slf4j
@Component
public class JwtAuthenticationEntryPoint implements ServerAuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();


    /**
     * 인증된 사용자만 호출할 수 있는 API인데 JWT가 주어지지 않았을때 처리하는 메소드  401 에러 처리
     */
    @Override
    public Mono<Void> commence(ServerWebExchange exchange, AuthenticationException ex) {

        log.error("Unauthorized error: {}", ex.getMessage());

        /// ServerHttpResponse (Spring WebFlux - Reactive 기반)
        /// httpSevlet리스폰스와 다름.

        ///응답을 가져옴.
        ServerHttpResponse response = exchange.getResponse();

        /// 응답 설정
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        Response<Void> errResp = Response.error(
                HttpStatus.UNAUTHORIZED,
                "JWT_AUTH_ERR",
                "로그인 후에 이용해주세요."
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