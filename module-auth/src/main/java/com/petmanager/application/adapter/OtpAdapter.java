package com.petmanager.application.adapter;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.stereotype.Component;

@Component
public interface OtpAdapter {

    void saveOtp(String email, String otp);

    boolean isValid(String email, String otp);
}
