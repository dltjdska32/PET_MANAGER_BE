"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatUserSchema = exports.ChatUser = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let ChatUser = class ChatUser {
    userId;
    username;
    userNickname = "unknown";
    userEmail;
    userRole;
    userMainImgUrl;
    userRegionIds;
    isDeleted;
    createdAt;
    updatedAt;
};
exports.ChatUser = ChatUser;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], ChatUser.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ChatUser.prototype, "username", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], ChatUser.prototype, "userNickname", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ChatUser.prototype, "userEmail", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 'ROLE_USER' }),
    __metadata("design:type", String)
], ChatUser.prototype, "userRole", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], ChatUser.prototype, "userMainImgUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Number], default: [] }),
    __metadata("design:type", Array)
], ChatUser.prototype, "userRegionIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], ChatUser.prototype, "isDeleted", void 0);
exports.ChatUser = ChatUser = __decorate([
    (0, mongoose_1.Schema)({
        collection: 'chat_users',
        timestamps: true,
        versionKey: false
    })
], ChatUser);
exports.ChatUserSchema = mongoose_1.SchemaFactory.createForClass(ChatUser);
//# sourceMappingURL=chat-user.schema.js.map