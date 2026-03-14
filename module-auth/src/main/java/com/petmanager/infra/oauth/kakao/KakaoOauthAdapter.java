package com.petmanager.infra.oauth.kakao;

import com.petmanager.application.port.OAuthPort;
import com.petmanager.domain.enums.Provider;
import com.petmanager.infra.oauth.OAuth2UserInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class KakaoOauthAdapter implements OAuthPort {

    @Value("${kakao.redirect.url}")
    private String REDIRECT_URL;

    @Value("${kakao.auth.url}")
    private String AUTH_URL;

    @Value("${kakao.token.url}")
    private String TOKEN_URL;

    @Value("${kakao.api.url}")
    private String API_URL;

    @Value("${kakao.client.id}")
    private String CLIENT_ID;

    @Value("${kakao.client.secret}")
    private String CLIENT_SECRET;

    private final RestTemplate restTemplate;

    @Override
    public boolean supoorts(Provider provider) {
        return provider.equals(Provider.KAKAO);
    }

    @Override
    public String getAccessToken(String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", CLIENT_ID);
        params.add("client_secret", CLIENT_SECRET);
        params.add("redirect_uri", REDIRECT_URL);
        params.add("code", code);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(
                TOKEN_URL, request, Map.class
        );

        return (String) response.getBody().get("access_token");
    }

    @Override
    public OAuth2UserInfo getUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(null, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(
                API_URL, request, Map.class
        );

        return new KakaoUserInfo(response.getBody());
    }

    @Override
    public String getRedirectUri() {
        return AUTH_URL +
                "?client_id=" +
                CLIENT_ID +
                "&redirect_uri=" +
                REDIRECT_URL +
                "&response_type=code";
    }
}
