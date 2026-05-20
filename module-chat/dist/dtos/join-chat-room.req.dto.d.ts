export declare class JoinChatRoomReqDto {
    readonly feedId: string;
    readonly chatRoomName?: string | undefined;
    readonly roomId?: string | undefined;
    constructor(feedId: string, chatRoomName?: string | undefined, roomId?: string | undefined);
}
