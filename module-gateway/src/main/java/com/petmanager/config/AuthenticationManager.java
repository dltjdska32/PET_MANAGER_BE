package com.petmanager.config;

import com.petmanager.modulegateway.utils.JwtUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class AuthenticationManager implements ReactiveAuthenticationManager {

    private final JwtUtil jwtUtil;

    @Override
    public Mono<Authentication> authenticate(Authentication authentication) {
        String authToken = authentication.getCredentials().toString();

        if (jwtUtil.validateToken(authToken)) {
            Claims claims = jwtUtil.getClaims(authToken);
            // role 클레임 이름이 실제 토큰과 일치해야 합니다. (global의 상수 확인 필요하지만 일단 'role'로 가정)
            // JWT_CLAIM_ROLE = "role" 이라면 맞습니다.
            String role = claims.get(GlobalConst.JWT_CLAIM_ROLE, String.class); 
            List<SimpleGrantedAuthority> authorities = role != null 
                ? Collections.singletonList(new SimpleGrantedAuthority(role)) 
                : Collections.emptyList();
            
            return Mono.just(new UsernamePasswordAuthenticationToken(
                claims.getSubject(), 
                null, 
                authorities
            ));
        } else {
            return Mono.empty();
        }
    }
}

