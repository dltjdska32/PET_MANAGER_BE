/**
 * module-global BasicUserInfo record 와 동일한 개념
 */
export interface BasicUserInfo {
  userId: string;
  username: string;
  email: string;
  role: string;
  accessTokenExpiresAt: number;
}
