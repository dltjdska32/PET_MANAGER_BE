"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindChatLogsRespDto = void 0;
class FindChatLogsRespDto {
    roomId;
    logid;
    createdAt;
    sender;
    readUserIds;
    messageType;
    message;
    file;
    constructor(roomId, logid, createdAt, sender, readUserIds, messageType, message, file) {
        this.roomId = roomId;
        this.logid = logid;
        this.createdAt = createdAt;
        this.sender = sender;
        this.readUserIds = readUserIds;
        this.messageType = messageType;
        this.message = message;
        this.file = file;
    }
}
exports.FindChatLogsRespDto = FindChatLogsRespDto;
//# sourceMappingURL=find-chat-logs.resp.dto.js.map