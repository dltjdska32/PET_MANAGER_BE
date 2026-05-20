"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatException = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("./base.exception");
class ChatException extends base_exception_1.BaseException {
    constructor(statusCode, code, message) {
        super(statusCode, code, message);
        this.name = 'ChatException';
    }
    static badRequest(message) {
        return new ChatException(common_1.HttpStatus.BAD_REQUEST, 'CHAT_ERR_01', message);
    }
    static roomNotFound(message) {
        return new ChatException(common_1.HttpStatus.NOT_FOUND, 'CHAT_ERR_02', message);
    }
    static UNAUTHORIZED(message) {
        return new ChatException(common_1.HttpStatus.UNAUTHORIZED, 'CHAT_ERR_03', message);
    }
}
exports.ChatException = ChatException;
//# sourceMappingURL=chat.exception.js.map