
export class ChatRoomLeftRespDto {
    public roomId: string;
    public userNickname: string;
    public userId: number;

    constructor(roomId: string, userNickname: string, userId: number) {
        this.roomId = roomId;
        this.userNickname = userNickname;
        this.userId = userId;
    }
}