export class WsJoinRoomRespDto {
    constructor(
        public readonly userId: number,
        public readonly userNickname: string,
        public readonly userName: string,
    ) {
    }
}