package com.petmanager.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

public class RegionException extends BaseException {
    public RegionException(HttpStatusCode statusCode, String code, String message) {
        super(statusCode, code, message);
    }


    public static RegionException badRequest(String message) {
        return new RegionException(HttpStatus.BAD_REQUEST, "REGION_ERR_01" , message);
    }
}
