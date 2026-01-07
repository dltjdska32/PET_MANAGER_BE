package com.petmanager.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "ACADEMY_CHAT v1.0",
                description = "ACADEMY_CHAT_DOMAIN_API_SPECIFICATION",
                version = "v1.0"
        )
)
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {

        return new OpenAPI()
                .components(new Components().addSecuritySchemes(
                        "bearer-auth",
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                ))  /// HTTP Bearer 토큰(JWT) 인증을 사용
                .addSecurityItem(
                        new SecurityRequirement().addList("bearer-auth")
                );  /// 모든 API 엔드포인트에 "bearer-auth"를 적용
        /// Swagger UI에서 모든 API에 인증 토큰 입력 가능
    }
}
