"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseException = void 0;
const common_1 = require("@nestjs/common");
class BaseException extends Error {
    statusCode;
    code;
    constructor(statusCode, code, message) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'BaseException';
    }
    static badRequest(code, message) {
        return new BaseException(common_1.HttpStatus.BAD_REQUEST, code, message);
    }
    static unauthorized(code, message) {
        return new BaseException(common_1.HttpStatus.UNAUTHORIZED, code, message);
    }
    static forbidden(code, message) {
        return new BaseException(common_1.HttpStatus.FORBIDDEN, code, message);
    }
    static notFound(code, message) {
        return new BaseException(common_1.HttpStatus.NOT_FOUND, code, message);
    }
    static conflict(code, message) {
        return new BaseException(common_1.HttpStatus.CONFLICT, code, message);
    }
    static internal(code, message) {
        return new BaseException(common_1.HttpStatus.INTERNAL_SERVER_ERROR, code, message);
    }
}
exports.BaseException = BaseException;
//# sourceMappingURL=base.exception.js.map