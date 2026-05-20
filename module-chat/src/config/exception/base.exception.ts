import { HttpStatus } from '@nestjs/common';

/**
 * module-global BaseException 대응
 */
export class BaseException extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'BaseException';
  }

  static badRequest(code: string, message: string): BaseException {
    return new BaseException(HttpStatus.BAD_REQUEST, code, message);
  }

  static unauthorized(code: string, message: string): BaseException {
    return new BaseException(HttpStatus.UNAUTHORIZED, code, message);
  }

  static forbidden(code: string, message: string): BaseException {
    return new BaseException(HttpStatus.FORBIDDEN, code, message);
  }

  static notFound(code: string, message: string): BaseException {
    return new BaseException(HttpStatus.NOT_FOUND, code, message);
  }

  static conflict(code: string, message: string): BaseException {
    return new BaseException(HttpStatus.CONFLICT, code, message);
  }

  static internal(code: string, message: string): BaseException {
    return new BaseException(HttpStatus.INTERNAL_SERVER_ERROR, code, message);
  }
}
