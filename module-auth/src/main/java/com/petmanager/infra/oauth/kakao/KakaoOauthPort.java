package com.petmanager.infra.oauth.kakao;



import com.petmanager.application.adapter.OAuthAdapter;
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
public class KakaoOauthPort implements OAuthAdapter {

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


    ///  엑세스 토큰을 받아온다.
    @Override
    public String getAccessToken(String code) {

        //헤더 설정.
        //  headers: {
        //      "Content-Type": `application/json`, // application/json 타입 선언
        //  }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        // 바디 설정.
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

        //헤더 설정.
        //  headers: {
        //      "Authorization" : Bearer accessToken ,
        //      "Content-Type": `application/json`,
        //  }
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
