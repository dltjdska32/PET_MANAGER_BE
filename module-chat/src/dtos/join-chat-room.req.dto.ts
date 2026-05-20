export class JoinChatRoomReqDto {
    constructor(
        public readonly feedId: string,
        public readonly chatRoomName?: string,
        public readonly roomId?: string,
    ) {
    }
}