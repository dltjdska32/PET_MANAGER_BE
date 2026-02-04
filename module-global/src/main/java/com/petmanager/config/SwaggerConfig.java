package com.petmanager.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "PET_MANAGER v1.0",
                description = "PET_MANAGER_API_SPECIFICATION",
                version = "v1.0"
        )
)
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {

        return new OpenAPI()
                .servers(
                        List.of(
                                new io.swagger.v3.oas.models.servers.Server()
                                        .url("http://localhost:8080/api/auth")
                                        .description("게이트웨이 포트를 강제한다.")
                        )
                )
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
