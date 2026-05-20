"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GlobalExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const api_response_1 = require("../api-response");
const base_exception_1 = require("./base.exception");
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter {
    logger = new common_1.Logger(GlobalExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse();
        const req = ctx.getRequest();
        if (exception instanceof base_exception_1.BaseException) {
            this.log(req, exception.code, exception.message);
            res
                .status(exception.statusCode)
                .json(api_response_1.ApiResponse.error(exception.statusCode, exception.code, exception.message));
            return;
        }
        if (exception instanceof common_1.HttpException) {
            const status = exception.getStatus();
            const body = exception.getResponse();
            const message = this.normalizeHttpMessage(body);
            const code = this.inferHttpCode(status, body);
            this.log(req, code, message);
            res.status(status).json(api_response_1.ApiResponse.error(status, code, message));
            return;
        }
        if (exception instanceof Error) {
            this.logger.error(`${req.method} ${req.url} — ${exception.message}`, exception.stack);
            res
                .status(common_1.HttpStatus.INTERNAL_SERVER_ERROR)
                .json(api_response_1.ApiResponse.error(common_1.HttpStatus.INTERNAL_SERVER_ERROR, 'INTERNAL_SERVER_ERR', '서버 내부 오류 발생.'));
            return;
        }
        this.logger.error(`${req.method} ${req.url} — unknown exception`, String(exception));
        res
            .status(common_1.HttpStatus.INTERNAL_SERVER_ERROR)
            .json(api_response_1.ApiResponse.error(common_1.HttpStatus.INTERNAL_SERVER_ERROR, 'INTERNAL_SERVER_ERR', '서버 내부 오류 발생.'));
    }
    log(req, code, message) {
        this.logger.error(`${req.method} ${req.url} — ${code}: ${message}`);
    }
    normalizeHttpMessage(body) {
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
    inferHttpCode(status, body) {
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
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = GlobalExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map