package com.petmanager.application.adapter;

import com.petmanager.domain.enums.Provider;
import com.petmanager.infra.oauth.OAuth2UserInfo;
import org.springframework.stereotype.Component;

@Component
public interface OAuthAdapter {

    boolean supoorts(Provider provider);

    String getAccessToken(String code);  // 인증 코드로 토큰 교환

    OAuth2UserInfo getUserInfo(String accessToken);

    String getRedirectUri();
}
