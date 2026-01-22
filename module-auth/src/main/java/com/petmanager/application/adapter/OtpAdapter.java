package com.petmanager.application.adapter;

import org.springframework.stereotype.Component;

@Component
public interface OtpAdapter {

    void saveOtp(String otp);
    boolean isValid(String otp);
}
