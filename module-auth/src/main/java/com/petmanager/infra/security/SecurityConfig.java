package com.petmanager.infra.security;

import com.petmanager.config.UserHeaderFilter;
import com.petmanager.config.JwtAccessDeniedHandler;
import com.petmanager.config.JwtAuthenticationEntryPoint;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


@RequiredArgsConstructor
@EnableWebSecurity
@EnableMethodSecurity(securedEnabled = true, prePostEnabled = true)//secured 어노테이션, preAuthorize어노테이션 활성화
public class SecurityConfig {

    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final UserHeaderFilter userHeaderFilter;


    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(8);
    }
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {

        httpSecurity.authorizeHttpRequests((auth) -> {

            auth
                    // /auth 요청 허용
                    .requestMatchers("/api/auth/**", "/login/**", "/join/**").permitAll()
                    // 정적 리소스
                    .requestMatchers("/css/**", "/images/**", "/js/**", "/favicon.ico").permitAll()
                    //  Swagger 관련 경로
                    .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                    // 나머지는 로그인 필수 (세부 권한은 @PreAuthorize로)
                    .anyRequest().authenticated();
        });


        /// jwt 설정 추가
        httpSecurity.addFilterBefore(userHeaderFilter, UsernamePasswordAuthenticationFilter.class);

        /// 403 , 401 에러 설정 추가
        httpSecurity.exceptionHandling(conf -> conf
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                .accessDeniedHandler(jwtAccessDeniedHandler)
        );

        //세션 사용 x
        httpSecurity.sessionManagement((session) -> {
            session.sessionCreationPolicy(SessionCreationPolicy.STATELESS);
        });


        // bearer 방식 사용을 위해
        // headers
        // Authorization: basic (ID, PW) <-> Authorization: bearer (토큰)
        httpSecurity.httpBasic((httpbasic) -> {
            httpbasic.disable();
        });


        httpSecurity.formLogin((formLogin) -> {
            formLogin.disable();
        });

        httpSecurity.csrf((auth) ->
                auth.disable()
        );


        return httpSecurity.build();
    }

}
