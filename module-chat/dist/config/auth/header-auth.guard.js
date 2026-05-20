"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeaderAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("../exception/base.exception");
const parse_basic_user_headers_1 = require("./parse-basic-user-headers");
let HeaderAuthGuard = class HeaderAuthGuard {
    canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const user = (0, parse_basic_user_headers_1.parseBasicUserFromHeaders)(req.headers);
        if (!user) {
            throw base_exception_1.BaseException.unauthorized('AUTH_ERR', '인증 정보가 없습니다.');
        }
        req.user = user;
        return true;
    }
};
exports.HeaderAuthGuard = HeaderAuthGuard;
exports.HeaderAuthGuard = HeaderAuthGuard = __decorate([
    (0, common_1.Injectable)()
], HeaderAuthGuard);
//# sourceMappingURL=header-auth.guard.js.map