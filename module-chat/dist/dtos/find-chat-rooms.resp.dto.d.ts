export declare class FindChatRoomsRespDto {
    readonly roomId: string;
    readonly feedId: string;
    readonly feedMainImgUrl: string | null;
    readonly title: string;
    readonly feedAuthorId: number;
    readonly feedAuthorNickname: string;
    readonly lastMessage?: string | null | undefined;
    readonly lastMessageId?: string | null | undefined;
    readonly lastMessageCreatedAt?: (Date | null) | undefined;
    readonly createdAt?: Date | undefined;
    readonly roomName?: string | null | undefined;
    constructor(roomId: string, feedId: string, feedMainImgUrl: string | null, title: string, feedAuthorId: number, feedAuthorNickname: string, lastMessage?: string | null | undefined, lastMessageId?: string | null | undefined, lastMessageCreatedAt?: (Date | null) | undefined, createdAt?: Date | undefined, roomName?: string | null | undefined);
}
