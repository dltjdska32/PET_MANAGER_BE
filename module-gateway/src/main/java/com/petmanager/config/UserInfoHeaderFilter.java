package com.petmanager.config;

import com.petmanager.exception.JwtException;
import com.petmanager.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import static com.petmanager.config.GlobalConst.*;


/// Gateway Filter Chain: 라우팅 및 헤더 조작 담당
/// Order(-1) 시큐리티 필터 다음, 라우팅 전에 자동으로 실행됨
@Slf4j
@Order(-1)
@Component
@RequiredArgsConstructor
public class UserInfoHeaderFilter implements GlobalFilter {

    private final JwtUtil jwtUtil;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        String authHeader = exchange.getRequest()
                .getHeaders()
                .getFirst(HttpHeaders.AUTHORIZATION);

        /// 로그인 회원가입등등 화이트 리스트에 접근해야하므로 없을경우 통과
        ///  이미 앞단 securityConfig에서 토큰 검증이 끝난상태.
        if(authHeader == null || !authHeader.startsWith("Bearer ")){
            return chain.filter(exchange);
        }

        String token = authHeader.substring(7);

        try{
            Long userId = jwtUtil.getUserId(token);
            String userRole = jwtUtil.getUserRole(token);
            String username = jwtUtil.getUsername(token);
            String userEmail = jwtUtil.getUserEmail(token);

            /// 헤더에 유저 정보 담아준다.
            exchange.getRequest().getHeaders().set(X_USER_ID_COOKIE_KEY, userId.toString());
            exchange.getRequest().getHeaders().set(X_USER_ROLE_COOKIE_KEY, userRole);
            exchange.getRequest().getHeaders().set(X_USER_NAME_COOKIE_KEY, username);
            exchange.getRequest().getHeaders().set(X_USER_EMAIL_COOKIE_KEY, userEmail);

            return chain.filter(exchange);
        } catch (JwtException e) {

            log.error("{}", e.getMessage());

            /// gatewayFilter(리액티브 체인)에서는 throw로 에러를 던지면 안됨.
            return Mono.error(e);
        } catch (Exception e) {
            log.error("알 수 없는 에러 발생 : {}", e.getMessage());
            return Mono.error(JwtException.serverEx("JWT 파싱 중 알 수 없는 오류 발생"));
        }
    }

}
