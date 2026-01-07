package com.petmanager.exception;



import com.petmanager.config.Response;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import javax.naming.AuthenticationException;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class BaseExceptionHandler {

    /// 커스텀 예외
    @Order(Ordered.HIGHEST_PRECEDENCE)
    @ExceptionHandler(BaseException.class)
    public Response<String> handleBaseException(BaseException e) {

        HttpStatusCode statusCode = e.getStatusCode();
        String code = e.getCode();
        String msg = e.getMessage();

        log.error("{}: {}", code, msg);

        return Response.error(statusCode, code, msg);
    }



    /// 권한 예외
    @Order(Ordered.HIGHEST_PRECEDENCE)
    @ExceptionHandler(AuthenticationException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public Response<Void> handleAuthenticationException(AuthenticationException e){

        log.error("{}: {}", "AUTH_ERR", e.getMessage());

        String msg = "접근 권한 오류 발생";

        return Response.error(HttpStatus.UNAUTHORIZED, "AUTH_ERR", msg);
    }


    /// 검증 예외
    @Order(Ordered.HIGHEST_PRECEDENCE)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Response<Void> handleMethodArgumentNotValidEx(MethodArgumentNotValidException e){


        String msg = e.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(ex -> ex.getField() + ": " + ex.getDefaultMessage())
                .collect(Collectors.joining(", "));

        log.error("{}: {}", HttpStatus.BAD_REQUEST, msg);

        return Response.error(HttpStatus.BAD_REQUEST, "INVALID_PARAM", msg);
    }


    /// 헤더 누락 예외
    @ExceptionHandler(MissingRequestHeaderException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public Response<Void> handleMissingHeaderEx(MissingRequestHeaderException e){

        log.error("{}: {}", "MISSING_HEADER_ERR", e.getMessage());

        String msg = "필수 헤더 누락 오류 발생.";

        return Response.error(HttpStatus.BAD_REQUEST, "MISSING_HEADER_ERR", msg);
    }


    /// 기타 서버 에러
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @Order(Ordered.LOWEST_PRECEDENCE)
    public Response<Void> handleInternalServerEx(Exception e) {

        log.error(e.getMessage());

        String msg = "서버 내부 오류 발생.";
        return Response.error(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERR", msg);
    }

}