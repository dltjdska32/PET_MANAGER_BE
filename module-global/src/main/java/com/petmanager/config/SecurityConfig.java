package com.petmanager.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(securedEnabled = true, prePostEnabled = true)//secured 어노테이션, preAuthorize어노테이션 활성화
public class SecurityConfig {

    @Bean
    public RoleHierarchy roleHierarchy() {

        //방식 1
        return RoleHierarchyImpl.withDefaultRolePrefix()
                .role("ADMIN").implies("MANAGER")
                .role("MANAGER").implies("USER")
                .build();
    }


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {

        httpSecurity
                .authorizeHttpRequests((auth) -> {
                    auth
                            .requestMatchers("/", "/login", "/loginProc","/join", "/joinProc").permitAll()
                            .requestMatchers("/admin/**").hasRole("ADMIN")       // 어드민 경로 Admin Role이있어야함
                            .requestMatchers("/manager/**").hasRole("MANAGER")   // 매니저 하위 경로는 매니저 등급 이상 접근
                            .requestMatchers("/my/**").hasAnyRole( "USER") // my 하위 경로는 유저 이상 접근
                            .anyRequest().authenticated();                         //그외 경로 인증된 사용자만 허용
                });


        httpSecurity.csrf((auth) ->
                auth.disable()
        );


        return httpSecurity.build();
    }



}