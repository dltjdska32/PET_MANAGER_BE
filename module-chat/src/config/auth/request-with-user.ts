import type { Request } from 'express';
import type { BasicUserInfo } from './basic-user-info';

/** Express.Request.user 타입을 명시 (전역 merge / getRequest 제네릭 회피) */
export type RequestWithUser = Request & {
  user?: BasicUserInfo;
};
