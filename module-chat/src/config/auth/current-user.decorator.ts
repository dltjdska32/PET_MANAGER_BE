import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { BasicUserInfo } from './basic-user-info';
import type { RequestWithUser } from './request-with-user';
import { BaseException } from '../exception/base.exception';
import { parseBasicUserFromHeaders } from './parse-basic-user-headers';

/**
 * Spring `@AuthenticationPrincipal` (optional) — 헤더 없으면 undefined (게스트)
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): BasicUserInfo | undefined => {
    const req = ctx.switchToHttp().getRequest<RequestWithUser>();
    const fromHeaders = parseBasicUserFromHeaders(req.headers);
    const user: BasicUserInfo | undefined = req.user ?? fromHeaders;
    return user;
  },
);

/**
 * Spring `@AuthenticationPrincipal` + 인증 필수 — 없으면 401
 */
export const AuthUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): BasicUserInfo => {
    const req = ctx.switchToHttp().getRequest<RequestWithUser>();
    const fromHeaders = parseBasicUserFromHeaders(req.headers);
    const user: BasicUserInfo | undefined = req.user ?? fromHeaders;
    if (user === undefined) {
      throw BaseException.unauthorized('AUTH_ERR', '인증 정보가 없습니다.');
    }
    return user;
  },
);
