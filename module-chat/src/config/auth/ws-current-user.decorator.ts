import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';
import type { BasicUserInfo } from './basic-user-info';
import { BaseException } from '../exception/base.exception';
import { parseBasicUserFromHeaders } from './parse-basic-user-headers';

/**
 * Socket 연결 시 handshake.headers 의 x-user-* (HTTP 와 동일 키)
 */
export const WsCurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): BasicUserInfo | undefined => {
    const client = ctx.switchToWs().getClient<Socket>();
    return parseBasicUserFromHeaders(client.handshake.headers);
  },
);

export const WsAuthUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): BasicUserInfo => {
    const client = ctx.switchToWs().getClient<Socket>();
    const user = parseBasicUserFromHeaders(client.handshake.headers);
    if (!user) {
      throw BaseException.unauthorized('AUTH_ERR', '인증 정보가 없습니다.');
    }
    return user;
  },
);
