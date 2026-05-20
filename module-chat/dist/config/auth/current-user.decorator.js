"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthUser = exports.CurrentUser = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("../exception/base.exception");
const parse_basic_user_headers_1 = require("./parse-basic-user-headers");
exports.CurrentUser = (0, common_1.createParamDecorator)((_data, ctx) => {
    const req = ctx.switchToHttp().getRequest();
    const fromHeaders = (0, parse_basic_user_headers_1.parseBasicUserFromHeaders)(req.headers);
    const user = req.user ?? fromHeaders;
    return user;
});
exports.AuthUser = (0, common_1.createParamDecorator)((_data, ctx) => {
    const req = ctx.switchToHttp().getRequest();
    const fromHeaders = (0, parse_basic_user_headers_1.parseBasicUserFromHeaders)(req.headers);
    const user = req.user ?? fromHeaders;
    if (user === undefined) {
        throw base_exception_1.BaseException.unauthorized('AUTH_ERR', '인증 정보가 없습니다.');
    }
    return user;
});
//# sourceMappingURL=current-user.decorator.js.map