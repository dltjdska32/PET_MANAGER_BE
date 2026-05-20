"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBasicUserFromHeaders = parseBasicUserFromHeaders;
const global_const_1 = require("../global-const");
function getHeader(headers, name) {
    const v = headers[name];
    if (v === undefined) {
        return undefined;
    }
    return Array.isArray(v) ? v[0] : v;
}
function parseBasicUserFromHeaders(headers) {
    const userId = getHeader(headers, global_const_1.GlobalConst.X_USER_ID_COOKIE_KEY);
    if (userId === undefined || userId === '') {
        return undefined;
    }
    const expRaw = getHeader(headers, global_const_1.GlobalConst.X_USER_EXP_COOKIE_KEY);
    const accessTokenExpiresAt = expRaw ? Number(expRaw) : 0;
    return {
        userId,
        username: getHeader(headers, global_const_1.GlobalConst.X_USER_NAME_COOKIE_KEY) ?? '',
        email: getHeader(headers, global_const_1.GlobalConst.X_USER_EMAIL_COOKIE_KEY) ?? '',
        role: getHeader(headers, global_const_1.GlobalConst.X_USER_ROLE_COOKIE_KEY) ?? '',
        accessTokenExpiresAt,
    };
}
//# sourceMappingURL=parse-basic-user-headers.js.map