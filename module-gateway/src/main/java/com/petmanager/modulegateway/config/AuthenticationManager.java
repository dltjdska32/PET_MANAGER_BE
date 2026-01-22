
package com.petmanager.modulegateway.config;

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

import static com.petmanager.config.GlobalConst.JWT_CLAIM_ROLE;

@Component
@RequiredArgsConstructor
public class AuthenticationManager implements ReactiveAuthenticationManager {

    private final JwtUtil jwtUtil;

    @Override
    public Mono<Authentication> authenticate(Authentication authentication) {
        String authToken = authentication.getCredentials().toString();

        if (!jwtUtil.validateToken(authToken)) {
            return Mono.empty();
        }

        Claims claims = jwtUtil.getClaims(authToken);

        String role = claims.get(JWT_CLAIM_ROLE, String.class);
        List<SimpleGrantedAuthority> authorities = role != null
                ? Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                : Collections.emptyList();

        return Mono.just(
                new UsernamePasswordAuthenticationToken(
                        claims.getSubject(),
                        null,
                        authorities
                )
        );
    }
}







