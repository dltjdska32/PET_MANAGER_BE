package com.petmanager.application.port;

import com.petmanager.domain.enums.Provider;
import com.petmanager.infra.oauth.OAuth2UserInfo;

public interface OAuthPort {

    boolean supoorts(Provider provider);

    String getAccessToken(String code);

    OAuth2UserInfo getUserInfo(String accessToken);

    String getRedirectUri();
}
