package com.petmanager.exception;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.petmanager.config.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.reactive.error.ErrorWebExceptionHandler;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;


/// 웹플럭스 전역 예외 처리

@Slf4j
@Order(-2) /// 스프링 기본 핸들러보다 우선순위 높게설정
            /// ErrorWebExceptionHandler 가 @order(-1) 따라서 해당 핸들러 보다 먼저 실행시키깅위해 설정.
            ///  해당 예외 처리기에서 처리하지 못한것만 스프링 기본 예외처리기로 넘김.
@Component
@RequiredArgsConstructor
public class BaseExceptionHandler implements ErrorWebExceptionHandler {

    private final ObjectMapper om;


    @Override
    public Mono<Void> handle(ServerWebExchange exchange, Throwable ex) {

        HttpStatusCode statusCode;
        String code;
        String message;

        if(ex instanceof BaseException baseException){                        /// 커스텀 예외

            statusCode = baseException.getStatusCode();
            code = baseException.getCode();
            message = baseException.getMessage();

            log.error("{} - {}", code, message);

        } else if (ex instanceof IllegalArgumentException illegalArgumentException) {    /// 잘못된인자 예외

            statusCode = HttpStatus.BAD_REQUEST;
            code = "INVALID_ARGUMENT";
            message = "잘못된 요청 인자: " + ex.getMessage();

            log.error("IllegalArgumentException 발생: {}", message);

        } else {                                                /// 기타 서버 예외

            // 예상하지 못한 모든 예외
            statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
            code = "INTERNAL_SERVER_ERR";
            message = "서버 내부 오류 발생";

            log.error("서버 예외 발생: ", ex);
        }

        ///  응답 생성
        Response<Void> errResp = Response.error(statusCode, code, message);

        /// http 응답설정
        exchange.getResponse().setStatusCode(statusCode);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

        /// json으로 반환
        try{

            byte[] bytes = om.writeValueAsBytes(errResp);
            DataBuffer wrap = exchange.getResponse().bufferFactory().wrap(bytes);
            return exchange.getResponse().writeWith(Mono.just(wrap));

        } catch (JsonProcessingException e){

            log.error("JSON 변환 실패", e);
            return exchange.getResponse().setComplete();
        }
    }
}
