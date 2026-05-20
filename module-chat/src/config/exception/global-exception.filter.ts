import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../api-response';
import { BaseException } from './base.exception';

/**
 * module-global BaseExceptionHandler 대응 (HTTP 컨텍스트만)
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    if (exception instanceof BaseException) {
      this.log(req, exception.code, exception.message);
      res
        .status(exception.statusCode)
        .json(
          ApiResponse.error(
            exception.statusCode,
            exception.code,
            exception.message,
          ),
        );
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const message = this.normalizeHttpMessage(body);
      const code = this.inferHttpCode(status, body);
      this.log(req, code, message);
      res.status(status).json(ApiResponse.error(status, code, message));
      return;
    }

    if (exception instanceof Error) {
      this.logger.error(
        `${req.method} ${req.url} — ${exception.message}`,
        exception.stack,
      );
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(
          ApiResponse.error(
            HttpStatus.INTERNAL_SERVER_ERROR,
            'INTERNAL_SERVER_ERR',
            '서버 내부 오류 발생.',
          ),
        );
      return;
    }

    this.logger.error(`${req.method} ${req.url} — unknown exception`, String(exception));
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(
        ApiResponse.error(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'INTERNAL_SERVER_ERR',
          '서버 내부 오류 발생.',
        ),
      );
  }

  private log(req: Request, code: string, message: string): void {
    this.logger.error(`${req.method} ${req.url} — ${code}: ${message}`);
  }

  private normalizeHttpMessage(body: string | object): string {
    if (typeof body === 'string') {
      return body;
    }
    const o = body as Record<string, unknown>;
    const msg = o.message;
    if (Array.isArray(msg)) {
      return msg.map(String).join(', ');
    }
    if (typeof msg === 'string') {
      return msg;
    }
    return '요청 처리 중 오류가 발생했습니다.';
  }

  private inferHttpCode(status: number, body: string | object): string {
    if (typeof body === 'object' && body !== null && 'error' in body) {
      const err = (body as { error?: string }).error;
      if (typeof err === 'string') {
        return err.replace(/\s+/g, '_').toUpperCase();
      }
    }
    const s = Number(status);
    if (s === 400) {
      return 'INVALID_PARAM';
    }
    if (s === 401) {
      return 'AUTH_ERR';
    }
    if (s === 403) {
      return 'FORBIDDEN';
    }
    if (s === 404) {
      return 'NOT_FOUND';
    }
    return `HTTP_${s}`;
  }
}
