package com.petmanager.infra.otp;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;

@Repository
@RequiredArgsConstructor
public class OtpRepoImpl implements OtpRepo {

    private static final String OTP_PREFIX = "OTP:";

    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${spring.mail.properties.ttl}")
    private Long ttl;

    @Override
    public void saveOtp(String email, String otp) {

        String key = createkey(otp);
        redisTemplate.opsForValue().set(key, email, Duration.ofSeconds(ttl));
    }

    @Override
    public boolean isValid(String email, String otp) {

        boolean result = false;

        String key = createkey(otp);

        String userEmail = (String) redisTemplate.opsForValue().get(key);

        if(userEmail != null && userEmail.equals(email)){
            result = true;
        }

        return result;
    }

    private String createkey(String otp) {
        return OTP_PREFIX + otp;
    }
}

