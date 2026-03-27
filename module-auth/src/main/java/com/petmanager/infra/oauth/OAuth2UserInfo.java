package com.petmanager.infra.oauth;


import com.petmanager.domain.enums.Provider;

public interface OAuth2UserInfo {


    String getProviderId();
    Provider getProvider();
    String getEmail();
    String getName();

}
