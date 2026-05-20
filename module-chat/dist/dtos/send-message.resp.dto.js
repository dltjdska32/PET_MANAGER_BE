"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendMessageRespDto = void 0;
class SendMessageRespDto {
    roomId;
    logid;
    createdAt;
    sender;
    readUserIds;
    messageType;
    message;
    file;
    isDeleted;
    updatedAt;
    constructor(chatLog) {
        this.roomId = chatLog.roomId;
        this.logid = chatLog._id.toString();
        this.createdAt = chatLog.createdAt;
        this.sender = chatLog.sender;
        this.readUserIds = chatLog.readUserIds.map((user) => user.userId);
        this.messageType = chatLog.messageType;
        this.message = chatLog.message;
        this.file = chatLog.file;
        this.isDeleted = chatLog.isDeleted;
        this.updatedAt = chatLog.updatedAt;
    }
}
exports.SendMessageRespDto = SendMessageRespDto;
//# sourceMappingURL=send-message.resp.dto.js.map