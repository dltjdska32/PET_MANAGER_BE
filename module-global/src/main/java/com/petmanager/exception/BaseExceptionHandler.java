package com.petmanager.exception;

import com.petmanager.config.Response;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.RestClientException;

import javax.naming.AuthenticationException;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class BaseExceptionHandler {

    /// 커스텀 예외
    @Order(Ordered.HIGHEST_PRECEDENCE)
    @ExceptionHandler(BaseException.class)
    public ResponseEntity<Response<String>> handleBaseException(BaseException e) {

        HttpStatusCode statusCode = e.getStatusCode();
        String code = e.getCode();
        String msg = e.getMessage();

        log.error("{}: {}", code, msg);

        return ResponseEntity.status(statusCode).body(Response.error(statusCode, code, msg));
    }


    /// api 예외
    @Order(Ordered.HIGHEST_PRECEDENCE)
    @ExceptionHandler(RestClientException.class)
    public ResponseEntity<Response<String>> handleRestClientException(RestClientException e) {

        log.error("{}: {}", "API_ERR", e.getMessage());

        String msg = "외부 API 호출 오류 발생";

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Response.error(HttpStatus.INTERNAL_SERVER_ERROR, msg, msg));
    }


    /// 도메인 및 잘못된 인자 예외 (illegalArgumentEx)
    @Order(Ordered.HIGHEST_PRECEDENCE)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Response<String>> handleIllegalArgumentException(IllegalArgumentException e) {

        log.error("{}: {}", "DOMAIN_ETC_ERR", e.getMessage());

        String msg = "도메인 및 잘못된 인자 오류 발생.";

        String detailMsg = e.getMessage();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Response.error(HttpStatus.INTERNAL_SERVER_ERROR, msg, detailMsg));
    }


    /// 권한 예외
    @Order(Ordered.HIGHEST_PRECEDENCE)
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Response<Void>> handleAuthenticationException(AuthenticationException e) {

        log.error("{}: {}", "AUTH_ERR", e.getMessage());

        String msg = "접근 권한 오류 발생";

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Response.error(HttpStatus.UNAUTHORIZED, "AUTH_ERR", msg));
    }


    /// 검증 예외
    @Order(Ordered.HIGHEST_PRECEDENCE)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Response<Void>> handleMethodArgumentNotValidEx(MethodArgumentNotValidException e) {

        String msg = e.getBindingResult()
                .getAllErrors()
                .stream()
                .map(err -> {
                    if (err instanceof org.springframework.validation.FieldError fe) {
                        return fe.getField() + ": " + fe.getDefaultMessage();
                    }
                    return err.getObjectName() + ": " + err.getDefaultMessage();
                })
                .collect(Collectors.joining(", "));

        log.error("{}: {}", HttpStatus.BAD_REQUEST, msg);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Response.error(HttpStatus.BAD_REQUEST, "INVALID_PARAM", msg));
    }


    /// @ModelAttribute 바인딩/검증 예외
    @Order(Ordered.HIGHEST_PRECEDENCE)
    @ExceptionHandler(BindException.class)
    public ResponseEntity<Response<Void>> handleBindException(BindException e) {

        String msg = e.getBindingResult()
                .getAllErrors()
                .stream()
                .map(err -> {
                    if (err instanceof org.springframework.validation.FieldError fe) {
                        return fe.getField() + ": " + fe.getDefaultMessage();
                    }
                    return err.getObjectName() + ": " + err.getDefaultMessage();
                })
                .collect(Collectors.joining(", "));

        log.error("{}: {}", HttpStatus.BAD_REQUEST, msg);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Response.error(HttpStatus.BAD_REQUEST, "INVALID_PARAM", msg));
    }


    /// 헤더 누락 예외
    @ExceptionHandler(MissingRequestHeaderException.class)
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public ResponseEntity<Response<Void>> handleMissingHeaderEx(MissingRequestHeaderException e) {

        log.error("{}: {}", "MISSING_HEADER_ERR", e.getMessage());

        String msg = "필수 헤더 누락 오류 발생.";

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Response.error(HttpStatus.BAD_REQUEST, "MISSING_HEADER_ERR", msg));
    }


    /// 기타 서버 에러
    @ExceptionHandler(Exception.class)
    @Order(Ordered.LOWEST_PRECEDENCE)
    public ResponseEntity<Response<Void>> handleInternalServerEx(Exception e) {

        log.error(e.getMessage());

        String msg = "서버 내부 오류 발생.";
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Response.error(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERR", msg));
    }

}
