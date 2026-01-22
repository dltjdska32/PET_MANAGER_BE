package com.petmanager.infra.otp;

public interface OtpRepo {
    void saveOtp(String email, String otp);
    boolean isValid(String email, String otp);
}
