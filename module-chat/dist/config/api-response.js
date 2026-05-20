"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    statusCode;
    code;
    message;
    value;
    constructor(statusCode, code, message, value) {
        this.statusCode = statusCode;
        this.code = code;
        this.message = message;
        this.value = value;
    }
    static ok(value) {
        if (value === undefined) {
            return new ApiResponse(200, 'SUCCESS', 'ok', null);
        }
        return new ApiResponse(200, 'SUCCESS', 'ok', value);
    }
    static okWithStatus(statusCode, value) {
        return new ApiResponse(statusCode, 'SUCCESS', 'ok', value);
    }
    static error(statusCode, code, message) {
        return new ApiResponse(statusCode, code, message, null);
    }
    static pagination(val) {
        return new ApiResponse(200, 'SUCCESS', 'ok', val);
    }
}
exports.ApiResponse = ApiResponse;
//# sourceMappingURL=api-response.js.map