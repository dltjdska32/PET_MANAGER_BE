package com.petmanager.config;

public abstract class GlobalConst {

    public static final String DEVICE_ID_HEADER_PREFIX = "device-id";

    public static final String AUTHORIZATION_HEADER = "Authorization";

    public static final String AUTHORIZATION_HEADER_TYPE = "Bearer ";

    public static final String TOKEN_PREFIX = "RT:";

    public static final String REFRESH_TOKEN_COOKIE_KEY =  "Refresh-Token";

    public static final String JWT_CLAIM_ROLE = "role";

    public static final String JWT_CLAIM_USERNAME = "username";

    public static final String JWT_CLAIM_EMAIL = "email";

    public static final String JWT_CLAIM_EXP = "exp";

    public static final String X_USER_ID_COOKIE_KEY = "x-user-id";

    public static final String X_USER_EXP_COOKIE_KEY = "x-user-exp";

    public static final String X_USER_ROLE_COOKIE_KEY = "x-user-role";

    public static final String X_USER_NAME_COOKIE_KEY = "x-user-name";

    public static final String X_USER_EMAIL_COOKIE_KEY = "x-user-email";

    public static final String AUTH_STREAM_KEY = "auth-events";

    /// 피드 도메인 스냅샷 → 챗 서버 동기화 (module-feed outbox → Redis Stream)
    public static final String FEED_CHAT_STREAM_KEY = "feed-chat-events";

    public static final String FEED_CONSUMER_GROUP = "feed-service-group";

    public static final String FEED_IMG_DIR = "feed-img";

    public static final String AUTH_IMG_DIR = "auth-img";

}
