import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { BaseException } from '../exception/base.exception';
import { parseBasicUserFromHeaders } from './parse-basic-user-headers';
import type { RequestWithUser } from './request-with-user';

/**
 * 헤더만 검사해 `request.user`에 붙임. `@AuthUser()` 와 함께 쓰거나, 이후 인터셉터에서 user 사용.
 */
@Injectable()
export class HeaderAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const user = parseBasicUserFromHeaders(req.headers);
    if (!user) {
      throw BaseException.unauthorized('AUTH_ERR', '인증 정보가 없습니다.');
    }
    req.user = user;
    return true;
  }
}
