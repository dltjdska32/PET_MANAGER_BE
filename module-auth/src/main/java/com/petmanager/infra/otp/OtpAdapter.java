package com.petmanager.infra.otp;

import com.petmanager.application.port.OtpPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OtpAdapter implements OtpPort {

    private final OtpRepo otpRepo;

    @Override
    public void saveOtp(String email, String otp) {
        otpRepo.saveOtp(email, otp);
    }

    @Override
    public boolean isValid(String email, String otp) {
        return otpRepo.isValid(email, otp);
    }
}
