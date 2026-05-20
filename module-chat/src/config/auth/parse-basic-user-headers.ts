import type { IncomingHttpHeaders } from 'http';
import { GlobalConst } from '../global-const';
import type { BasicUserInfo } from './basic-user-info';

function getHeader(headers: IncomingHttpHeaders, name: string): string | undefined {
  const v = headers[name];
  if (v === undefined) {
    return undefined;
  }
  return Array.isArray(v) ? v[0] : v;
}

/**
 * 게이트웨이 → 서비스로 넘어오는 x-user-* 헤더 (UserHeaderFilter 와 동일 키)
 */
export function parseBasicUserFromHeaders(
  headers: IncomingHttpHeaders,
): BasicUserInfo | undefined {
  const userId = getHeader(headers, GlobalConst.X_USER_ID_COOKIE_KEY);
  if (userId === undefined || userId === '') {
    return undefined;
  }
  const expRaw = getHeader(headers, GlobalConst.X_USER_EXP_COOKIE_KEY);
  const accessTokenExpiresAt = expRaw ? Number(expRaw) : 0;

  return {
    userId,
    username: getHeader(headers, GlobalConst.X_USER_NAME_COOKIE_KEY) ?? '',
    email: getHeader(headers, GlobalConst.X_USER_EMAIL_COOKIE_KEY) ?? '',
    role: getHeader(headers, GlobalConst.X_USER_ROLE_COOKIE_KEY) ?? '',
    accessTokenExpiresAt,
  };
}
