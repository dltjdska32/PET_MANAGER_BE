package com.petmanager.application.port;

public interface OtpPort {

    void saveOtp(String email, String otp);

    boolean isValid(String email, String otp);
}
