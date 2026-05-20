"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindChatRoomsRespDto = void 0;
class FindChatRoomsRespDto {
    roomId;
    feedId;
    feedMainImgUrl;
    title;
    feedAuthorId;
    feedAuthorNickname;
    lastMessage;
    lastMessageId;
    lastMessageCreatedAt;
    createdAt;
    roomName;
    constructor(roomId, feedId, feedMainImgUrl, title, feedAuthorId, feedAuthorNickname, lastMessage, lastMessageId, lastMessageCreatedAt, createdAt, roomName) {
        this.roomId = roomId;
        this.feedId = feedId;
        this.feedMainImgUrl = feedMainImgUrl;
        this.title = title;
        this.feedAuthorId = feedAuthorId;
        this.feedAuthorNickname = feedAuthorNickname;
        this.lastMessage = lastMessage;
        this.lastMessageId = lastMessageId;
        this.lastMessageCreatedAt = lastMessageCreatedAt;
        this.createdAt = createdAt;
        this.roomName = roomName;
    }
}
exports.FindChatRoomsRespDto = FindChatRoomsRespDto;
//# sourceMappingURL=find-chat-rooms.resp.dto.js.map