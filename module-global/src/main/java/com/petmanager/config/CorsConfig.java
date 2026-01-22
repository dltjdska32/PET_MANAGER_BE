package com.petmanager.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;

import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;


/// swagger사용을 위해 사용
@Configuration
public class CorsConfig {
    // cors 설정 필터
    @Bean
    public CorsFilter corsFilter() {

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // 모든 도메인(ip) 허용 -> 개발 편이성을 위해 운영시 특정 도메인만 허용
        config.setAllowedOrigins(Arrays.asList("*"));

        // 허용할 http 메서드 (get / post/ put/ fetch/ delete)
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH"));

        // 요청에 credential (쿠키 http인증해더 등등) 을 포함할지 여부
        // 서버 응답할때 json을 자바스크립트에서 처리할수 있게 할지 설정.
        config.setAllowCredentials(true);

        // 허용할 헤더 설정
        config.setAllowedHeaders(Arrays.asList("*"));


        // 모든 "/api/**" 경로에 CORS 설정 적용
        source.registerCorsConfiguration("/api/**", config);

        return new CorsFilter(source);
    }
}