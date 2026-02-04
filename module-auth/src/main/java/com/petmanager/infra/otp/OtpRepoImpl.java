package com.petmanager.infra.otp;


import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;

@Repository
@RequiredArgsConstructor
public class OtpRepoImpl implements OtpRepo {

    private static final String OTP_PREFIX = "OTP-KEY:";

    private final StringRedisTemplate stringRedisTemplate;

    @Value("${spring.mail.properties.ttl}")
    private Long ttl;

    @Override
    public void saveOtp(String email, String otp) {

        String key = createkey(email);
        stringRedisTemplate.opsForValue().set(key, otp, Duration.ofSeconds(ttl));
    }

    @Override
    public boolean isValid(String email, String otp) {

        boolean result = false;

        String key = createkey(email);

        String val = stringRedisTemplate.opsForValue().get(key);

        if(val != null && val.equals(otp)){
            result = true;
        }

        return result;
    }

    private String createkey(String email) {
        return OTP_PREFIX + email;
    }
}

