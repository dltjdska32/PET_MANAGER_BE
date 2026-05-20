import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ApiResponse } from '../api-response';
import { BaseException } from './base.exception';

/** 클라이언트가 구독할 WS 에러 이벤트 이름 */
export const WS_EXCEPTION_EVENT = 'WS_ERR_EVENT';

type WsExceptionLogger = Pick<Logger, 'warn' | 'error'>;

/** gateway try/catch · WsExceptionFilter 공통 — throw 없이 클라이언트에만 전달 */
export function emitWsException(
  client: Socket,
  exception: unknown,
  logger?: WsExceptionLogger,
): void {
  if (exception instanceof BaseException) {
    logger?.warn(`[ws ${client.id}] ${exception.code}: ${exception.message}`);
    client.emit(
      WS_EXCEPTION_EVENT,
      ApiResponse.error(exception.statusCode, exception.code, exception.message),
    );
    return;
  }

  if (exception instanceof WsException) {
    const err = exception.getError();
    const payload = normalizeWsExceptionPayload(err);
    logger?.warn(`[ws ${client.id}] ${payload.code}: ${payload.message}`);
    client.emit(WS_EXCEPTION_EVENT, payload);
    return;
  }

  if (exception instanceof HttpException) {
    const status = exception.getStatus();
    const body = exception.getResponse();
    const message = normalizeHttpMessage(body);
    const code = inferHttpCode(status, body);
    logger?.warn(`[ws ${client.id}] ${code}: ${message}`);
    client.emit(WS_EXCEPTION_EVENT, ApiResponse.error(status, code, message));
    return;
  }

  if (exception instanceof Error) {
    logger?.error(`[ws ${client.id}] ${exception.message}`, exception.stack);
    client.emit(
      WS_EXCEPTION_EVENT,
      ApiResponse.error(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'INTERNAL_SERVER_ERR',
        '서버 내부 오류 발생.',
      ),
    );
    return;
  }

  logger?.error(`[ws ${client.id}] unknown: ${String(exception)}`);
  client.emit(
    WS_EXCEPTION_EVENT,
    ApiResponse.error(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'INTERNAL_SERVER_ERR',
      '서버 내부 오류 발생.',
    ),
  );
}

function normalizeWsExceptionPayload(err: string | object): ApiResponse<null> {
    if (typeof err === 'string') {
      return ApiResponse.error(HttpStatus.BAD_REQUEST, 'WS_ERR', err);
    }
    const o = err as Record<string, unknown>;
    const code = typeof o.code === 'string' ? o.code : 'WS_ERR';
    const message =
      typeof o.message === 'string' ? o.message : JSON.stringify(err);
    const statusCode =
      typeof o.statusCode === 'number' ? o.statusCode : HttpStatus.BAD_REQUEST;
    return ApiResponse.error(statusCode, code, message);
}

function normalizeHttpMessage(body: string | object): string {
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

function inferHttpCode(status: number, body: string | object): string {
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

/**
 * HTTP GlobalExceptionFilter 와 동일한 ApiResponse 본문으로 소켓에 전달
 */
@Catch()
export class WsExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(WsExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const client = host.switchToWs().getClient<Socket>();
    emitWsException(client, exception, this.logger);
  }
}
