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
exports.ChatLogSchema = exports.ChatLog = exports.MessageType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const chat_user_info_dto_1 = require("../dtos/chat-user-info.dto");
var MessageType;
(function (MessageType) {
    MessageType["FILE"] = "FILE";
    MessageType["TEXT"] = "TEXT";
})(MessageType || (exports.MessageType = MessageType = {}));
let ChatLog = class ChatLog {
    roomId;
    messageType;
    message;
    sender;
    readUserIds;
    file;
    isDeleted;
    createdAt;
    updatedAt;
};
exports.ChatLog = ChatLog;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ChatLog.prototype, "roomId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: MessageType, required: true }),
    __metadata("design:type", String)
], ChatLog.prototype, "messageType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], ChatLog.prototype, "message", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: chat_user_info_dto_1.ChatUserInfo, required: true }),
    __metadata("design:type", chat_user_info_dto_1.ChatUserInfo)
], ChatLog.prototype, "sender", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [chat_user_info_dto_1.ChatUserInfo], default: [] }),
    __metadata("design:type", Array)
], ChatLog.prototype, "readUserIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                originalName: String,
                storedName: String,
                mimeType: String,
                url: String,
            },
        ],
        required: false,
    }),
    __metadata("design:type", Array)
], ChatLog.prototype, "file", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], ChatLog.prototype, "isDeleted", void 0);
exports.ChatLog = ChatLog = __decorate([
    (0, mongoose_1.Schema)({
        collection: 'chat_logs',
        timestamps: true,
        versionKey: false,
    })
], ChatLog);
exports.ChatLogSchema = mongoose_1.SchemaFactory.createForClass(ChatLog);
//# sourceMappingURL=chat-logs.schema.js.map