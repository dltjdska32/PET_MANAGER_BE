    package com.petmanager.config;

    import lombok.RequiredArgsConstructor;
    import org.springframework.context.annotation.Bean;
    import org.springframework.context.annotation.Configuration;
    import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
    import org.springframework.security.config.web.server.ServerHttpSecurity;
    import org.springframework.security.web.server.SecurityWebFilterChain;

    @Configuration
    @EnableWebFluxSecurity
    @RequiredArgsConstructor
    public class SecurityConfig {

        private final AuthenticationManager authenticationManager;
        private final SecurityContextRepository securityContextRepository;
        private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
        private final JwtAccessDeniedHandler jwtAccessDeniedHandler;

        private static final String[] WHITE_LIST = {
                // Auth 서비스
                "/api/auth/login/**",
                "/api/auth/join/**",
                "/api/auth/email/otp/**",
                "/api/auth/reissue/**",

                // 각 모듈 Swagger UI & OpenAPI
                "/api/auth/swagger-ui/**",
                "/api/auth/v3/api-docs/**",
                "/api/feed/swagger-ui/**",
                "/api/feed/v3/api-docs/**",
                "/api/chat/swagger-ui/**",
                "/api/chat/v3/api-docs/**",

                // Actuator
                "/actuator/**"
        };

        @Bean
        public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {



            return http
                    .csrf(ServerHttpSecurity.CsrfSpec::disable)
                    .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                    .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                    .authenticationManager(authenticationManager)
                    .securityContextRepository(securityContextRepository)
                    .exceptionHandling(exceptionHandlingSpec ->
                        /// 예외 처리 핸들러 변경
                        ///  커스텀한 jwt인증/인가 헨들러로 변경
                        exceptionHandlingSpec
                                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                                .accessDeniedHandler(jwtAccessDeniedHandler)
                    )
                    .authorizeExchange(exchanges -> exchanges
                            .pathMatchers(WHITE_LIST).permitAll()
                            .anyExchange().authenticated()
                    )
                    .build();
        }
    }

