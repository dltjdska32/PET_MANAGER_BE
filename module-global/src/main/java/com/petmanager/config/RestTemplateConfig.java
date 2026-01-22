package com.petmanager.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.DefaultResponseErrorHandler;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;

@Configuration
@Slf4j
public class RestTemplateConfig {

    @Value("${restTemplate.connect.timeout}")
    private int connTimeout;

    @Value("${restTemplate.read.timeout}")
    private int readTimeout;

    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(connTimeout);
        factory.setReadTimeout(readTimeout);


        RestTemplate restTemplate = new RestTemplate(factory);

        // 에러 핸들러
        restTemplate.setErrorHandler(new DefaultResponseErrorHandler() {
            @Override
            public void handleError(ClientHttpResponse response) throws IOException {
                log.error("RestTemplate Error: {}", response.getStatusCode());
                super.handleError(response);
            }
        });

        // 공통 인터셉터
        restTemplate.getInterceptors().add((request, body, execution) -> {
            log.info("Request: {} {}", request.getMethod(), request.getURI());
            ClientHttpResponse response = execution.execute(request, body);
            log.info("Response: {}", response.getStatusCode());
            return response;
        });

        return restTemplate;
    }

}
