package com.petmanager.application.exception;

import com.petmanager.exception.BaseException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

public class
AuthException extends BaseException {

    public AuthException(HttpStatusCode statusCode, String code, String message) {
        super(statusCode, code, message);
    }

    public static AuthException unauthorized(String message) {
        return new AuthException(HttpStatus.UNAUTHORIZED, "AUTH_FAIL_01" , message);
    }

    public static AuthException badRequest(String message) {
        return new AuthException(HttpStatus.BAD_REQUEST, "AUTH_FAIL_02" , message);
    }

    public static AuthException apiErr(String message) {
        return new AuthException(HttpStatus.BAD_REQUEST, "AUTH_FAIL_03" , message);
    }

    public static AuthException serverErr(String message) {
        return new AuthException(HttpStatus.BAD_REQUEST, "AUTH_FAIL_04" , message);
    }
}
