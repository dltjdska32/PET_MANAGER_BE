import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

/**
 * RegionException 과 같이 도메인별 팩토리 예시
 */
export class ChatException extends BaseException {
  constructor(statusCode: number, code: string, message: string) {
    super(statusCode, code, message);
    this.name = 'ChatException';
  }

  static badRequest(message: string): ChatException {
    return new ChatException(HttpStatus.BAD_REQUEST, 'CHAT_ERR_01', message);
  }

  static roomNotFound(message: string): ChatException {
    return new ChatException(HttpStatus.NOT_FOUND, 'CHAT_ERR_02', message);
  }

  static UNAUTHORIZED(message: string): ChatException {
    return new ChatException(HttpStatus.UNAUTHORIZED, 'CHAT_ERR_03', message);
  }
}
