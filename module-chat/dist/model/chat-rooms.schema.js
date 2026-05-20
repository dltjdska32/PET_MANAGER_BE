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
exports.ChatRoomSchema = exports.ChatRoom = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const feedInfoSchema = {
    feedId: String,
    authorId: Number,
    authorUsername: String,
    authorNickname: String,
    title: String,
    description: String,
    regionId: Number,
    mainImgUrl: [String],
    sideImgUrl: [String],
    pay: Number,
    startDate: Date,
    endDate: Date,
    likesCount: Number,
    feedType: String,
    feedCreatedAt: Date,
    feedUpdatedAt: Date,
};
let ChatRoom = class ChatRoom {
    feedInfo;
    chatRoomName;
    creatorId;
    chatMembers;
    lastMessage;
    lastMessageId;
    lastMessageCreatedAt;
    createdAt;
    updatedAt;
    isDeleted;
};
exports.ChatRoom = ChatRoom;
__decorate([
    (0, mongoose_1.Prop)({
        type: feedInfoSchema,
        required: true,
    }),
    __metadata("design:type", Object)
], ChatRoom.prototype, "feedInfo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 'default_chat_room' }),
    __metadata("design:type", String)
], ChatRoom.prototype, "chatRoomName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], ChatRoom.prototype, "creatorId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{
                userId: { type: Number, required: true },
                username: { type: String, required: false },
                userNickname: { type: String, required: true },
                userEmail: { type: String, required: true },
            }],
        default: [],
    }),
    __metadata("design:type", Array)
], ChatRoom.prototype, "chatMembers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], ChatRoom.prototype, "lastMessage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], ChatRoom.prototype, "lastMessageId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Date)
], ChatRoom.prototype, "lastMessageCreatedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], ChatRoom.prototype, "isDeleted", void 0);
exports.ChatRoom = ChatRoom = __decorate([
    (0, mongoose_1.Schema)({
        collection: 'chat_rooms',
        timestamps: true,
        versionKey: false,
    })
], ChatRoom);
exports.ChatRoomSchema = mongoose_1.SchemaFactory.createForClass(ChatRoom);
//# sourceMappingURL=chat-rooms.schema.js.map