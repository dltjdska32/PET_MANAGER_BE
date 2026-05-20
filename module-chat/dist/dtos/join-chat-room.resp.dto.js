"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinChatRoomRespDto = void 0;
class JoinChatRoomRespDto {
    roomId;
    feedInfo;
    chatMembers;
    creatorId;
    chatLogs;
    chatRoomName;
    constructor(roomId, feedInfo, chatMembers, creatorId, chatLogs, chatRoomName) {
        this.roomId = roomId;
        this.feedInfo = feedInfo;
        this.chatMembers = chatMembers;
        this.creatorId = creatorId;
        this.chatLogs = chatLogs;
        this.chatRoomName = chatRoomName;
    }
}
exports.JoinChatRoomRespDto = JoinChatRoomRespDto;
//# sourceMappingURL=join-chat-room.resp.dto.js.map