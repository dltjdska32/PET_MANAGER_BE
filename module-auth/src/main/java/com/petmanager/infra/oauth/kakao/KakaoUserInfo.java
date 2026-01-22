package com.petmanager.infra.oauth.kakao;


import com.petmanager.domain.enums.Provider;
import com.petmanager.infra.oauth.OAuth2UserInfo;

import java.util.Map;


/// 카카오 반환타입
/// {
///     "id":123456789,
///     "connected_at": "2022-04-11T01:45:28Z",
///     "kakao_account": {
///         "profile": {
///             "nickname": "홍길동",
///             "thumbnail_image_url": "http://yyy.kakao.com/.../img_110x110.jpg",
///             "profile_image_url": "http://yyy.kakao.com/dn/.../img_640x640.jpg",
///             "is_default_image":false,
///             "is_default_nickname": false
///         },
///         "name":"홍길동",
///         "email": "sample@sample.com",
///     }
/// }

public class KakaoUserInfo implements OAuth2UserInfo {

    private final Map<String, Object> attributes;

    public KakaoUserInfo(Map<String, Object> attributes) {

        this.attributes = attributes;
    }


    @Override
    public String getProviderId() {
        return (String) attributes.get("id");
    }

    @Override
    public Provider getProvider() {
        return Provider.KAKAO;
    }

    @Override
    public String getEmail() {

        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        if (kakaoAccount != null) {
            return (String) kakaoAccount.get("email");
        }

        return null;
    }

    @Override
    public String getName() {

        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");

        // name이 있으면 name 사용, 없으면 profile.nickname 사용
        if (kakaoAccount != null) {

            String name = (String) kakaoAccount.get("name");
            if (name != null && !name.isEmpty()) {
                return name;
            }

            // profile.nickname 사용
            Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
            if (profile != null) {
                return (String) profile.get("nickname");
            }
        }

        return null;
    }
}
