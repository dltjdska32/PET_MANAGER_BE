"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsAuthUser = exports.WsCurrentUser = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("../exception/base.exception");
const parse_basic_user_headers_1 = require("./parse-basic-user-headers");
exports.WsCurrentUser = (0, common_1.createParamDecorator)((_data, ctx) => {
    const client = ctx.switchToWs().getClient();
    return (0, parse_basic_user_headers_1.parseBasicUserFromHeaders)(client.handshake.headers);
});
exports.WsAuthUser = (0, common_1.createParamDecorator)((_data, ctx) => {
    const client = ctx.switchToWs().getClient();
    const user = (0, parse_basic_user_headers_1.parseBasicUserFromHeaders)(client.handshake.headers);
    if (!user) {
        throw base_exception_1.BaseException.unauthorized('AUTH_ERR', '인증 정보가 없습니다.');
    }
    return user;
});
//# sourceMappingURL=ws-current-user.decorator.js.map