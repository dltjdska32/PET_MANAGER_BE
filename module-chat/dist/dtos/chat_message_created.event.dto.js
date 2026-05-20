"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMessageCreatedEvent = exports.CHAT_MESSAGE_CREATED = void 0;
exports.CHAT_MESSAGE_CREATED = 'chat.message.created';
class ChatMessageCreatedEvent {
    roomId;
    payload;
    constructor(roomId, payload) {
        this.roomId = roomId;
        this.payload = payload;
    }
}
exports.ChatMessageCreatedEvent = ChatMessageCreatedEvent;
//# sourceMappingURL=chat_message_created.event.dto.js.map