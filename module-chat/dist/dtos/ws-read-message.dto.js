"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsReadMessageDto = void 0;
class WsReadMessageDto {
    roomId;
    lastMessageId;
    constructor(roomId, lastMessageId) {
        this.roomId = roomId;
        this.lastMessageId = lastMessageId;
    }
}
exports.WsReadMessageDto = WsReadMessageDto;
//# sourceMappingURL=ws-read-message.dto.js.map