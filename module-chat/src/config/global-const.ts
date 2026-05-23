export const GlobalConst = {

  DEVICE_ID_HEADER_PREFIX: 'device-id',

  AUTHORIZATION_HEADER: 'Authorization',

  AUTHORIZATION_HEADER_TYPE: 'Bearer ',

  TOKEN_PREFIX: 'RT:',

  REFRESH_TOKEN_COOKIE_KEY: 'Refresh-Token',

  JWT_CLAIM_ROLE: 'role',

  JWT_CLAIM_USERNAME: 'username',

  JWT_CLAIM_EMAIL: 'email',

  JWT_CLAIM_EXP: 'exp',

  X_USER_ID_COOKIE_KEY: 'x-user-id',

  X_USER_EXP_COOKIE_KEY: 'x-user-exp',

  X_USER_ROLE_COOKIE_KEY: 'x-user-role',

  X_USER_NAME_COOKIE_KEY: 'x-user-name',

  X_USER_EMAIL_COOKIE_KEY: 'x-user-email',

  AUTH_STREAM_KEY: 'auth-events',

  FEED_CHAT_STREAM_KEY: 'feed-chat-events',

  FEED_CONSUMER_GROUP: 'feed-service-group',

  CHAT_CONSUMER_GROUP: 'chat-service-group',

  /** 피드 스냅샷 동기화 전용 (auth 스트림과 분리) */
  CHAT_FEED_SYNC_GROUP: 'chat-feed-sync-group',

  CHAT_FEED_SYNC_CONSUMER_NAME: 'chat-feed-sync-1',

  CHAT_CONSUMER_GROUP_NAME: 'chat-consumer-1',

  FEED_IMG_DIR: 'feed-img',

  AUTH_IMG_DIR: 'auth-img',

  CHAT_FILE_DIR: 'chat-files',
} as const;

export type GlobalConstKey = keyof typeof GlobalConst;
