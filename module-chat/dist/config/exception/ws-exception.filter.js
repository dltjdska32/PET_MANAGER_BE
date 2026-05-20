"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WsExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsExceptionFilter = exports.WS_EXCEPTION_EVENT = void 0;
exports.emitWsException = emitWsException;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const api_response_1 = require("../api-response");
const base_exception_1 = require("./base.exception");
exports.WS_EXCEPTION_EVENT = 'WS_ERR_EVENT';
function emitWsException(client, exception, logger) {
    if (exception instanceof base_exception_1.BaseException) {
        logger?.warn(`[ws ${client.id}] ${exception.code}: ${exception.message}`);
        client.emit(exports.WS_EXCEPTION_EVENT, api_response_1.ApiResponse.error(exception.statusCode, exception.code, exception.message));
        return;
    }
    if (exception instanceof websockets_1.WsException) {
        const err = exception.getError();
        const payload = normalizeWsExceptionPayload(err);
        logger?.warn(`[ws ${client.id}] ${payload.code}: ${payload.message}`);
        client.emit(exports.WS_EXCEPTION_EVENT, payload);
        return;
    }
    if (exception instanceof common_1.HttpException) {
        const status = exception.getStatus();
        const body = exception.getResponse();
        const message = normalizeHttpMessage(body);
        const code = inferHttpCode(status, body);
        logger?.warn(`[ws ${client.id}] ${code}: ${message}`);
        client.emit(exports.WS_EXCEPTION_EVENT, api_response_1.ApiResponse.error(status, code, message));
        return;
    }
    if (exception instanceof Error) {
        logger?.error(`[ws ${client.id}] ${exception.message}`, exception.stack);
        client.emit(exports.WS_EXCEPTION_EVENT, api_response_1.ApiResponse.error(common_1.HttpStatus.INTERNAL_SERVER_ERROR, 'INTERNAL_SERVER_ERR', '서버 내부 오류 발생.'));
        return;
    }
    logger?.error(`[ws ${client.id}] unknown: ${String(exception)}`);
    client.emit(exports.WS_EXCEPTION_EVENT, api_response_1.ApiResponse.error(common_1.HttpStatus.INTERNAL_SERVER_ERROR, 'INTERNAL_SERVER_ERR', '서버 내부 오류 발생.'));
}
function normalizeWsExceptionPayload(err) {
    if (typeof err === 'string') {
        return api_response_1.ApiResponse.error(common_1.HttpStatus.BAD_REQUEST, 'WS_ERR', err);
    }
    const o = err;
    const code = typeof o.code === 'string' ? o.code : 'WS_ERR';
    const message = typeof o.message === 'string' ? o.message : JSON.stringify(err);
    const statusCode = typeof o.statusCode === 'number' ? o.statusCode : common_1.HttpStatus.BAD_REQUEST;
    return api_response_1.ApiResponse.error(statusCode, code, message);
}
function normalizeHttpMessage(body) {
    if (typeof body === 'string') {
        return body;
    }
    const o = body;
    const msg = o.message;
    if (Array.isArray(msg)) {
        return msg.map(String).join(', ');
    }
    if (typeof msg === 'string') {
        return msg;
    }
    return '요청 처리 중 오류가 발생했습니다.';
}
function inferHttpCode(status, body) {
    if (typeof body === 'object' && body !== null && 'error' in body) {
        const err = body.error;
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
let WsExceptionFilter = WsExceptionFilter_1 = class WsExceptionFilter {
    logger = new common_1.Logger(WsExceptionFilter_1.name);
    catch(exception, host) {
        const client = host.switchToWs().getClient();
        emitWsException(client, exception, this.logger);
    }
};
exports.WsExceptionFilter = WsExceptionFilter;
exports.WsExceptionFilter = WsExceptionFilter = WsExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], WsExceptionFilter);
//# sourceMappingURL=ws-exception.filter.js.map