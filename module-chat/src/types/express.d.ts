import type { BasicUserInfo } from '../config/auth/basic-user-info';

declare global {
  namespace Express {
    interface Request {
      user?: BasicUserInfo;
    }
  }
}

export {};
