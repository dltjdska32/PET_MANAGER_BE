export class ChatUserInfo {
    constructor(
        public readonly userId: number,
        public readonly username: string,
        public readonly userNickname: string,
        public readonly userEmail: string,
    ) {
    }
}