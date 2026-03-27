package com.petmanager.application.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class OtpDto {

    private String otp;

    public static OtpDto createOtp(){

        String otp = UUID.randomUUID().toString().substring(0, 6);
        return new OtpDto(otp);
    }
}
