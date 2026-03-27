package com.petmanager.infra.security;

import com.petmanager.config.UserHeaderFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;


@Configuration
@RequiredArgsConstructor
@EnableWebSecurity
@EnableMethodSecurity(securedEnabled = true, prePostEnabled = true)//secured 어노테이션, preAuthorize어노테이션 활성화
public class SecurityConfig {

    private final UserHeaderFilter userHeaderFilter;

    private final CorsConfigurationSource corsConfigurationSource;


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {

        /// 검증은 게이트웨이에서
        httpSecurity.authorizeHttpRequests(auth -> auth.anyRequest().permitAll());

        /// jwt 설정 추가
        httpSecurity.addFilterBefore(userHeaderFilter, UsernamePasswordAuthenticationFilter.class);

        /// 8080 게이트웨이에서오는 요청 cors설정
        httpSecurity.cors(cors -> cors.configurationSource(corsConfigurationSource));

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
