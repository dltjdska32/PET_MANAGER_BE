
export class FindChatRoomsRespDto {

  constructor(

    public readonly roomId: string,

    public readonly feedId: string,

    public readonly feedMainImgUrl: string | null,

    public readonly title: string,

    public readonly feedAuthorId: number,

    public readonly feedAuthorNickname: string,

    public readonly lastMessage?: string | null,

    public readonly lastMessageId?: string | null,

    public readonly lastMessageCreatedAt?: Date | null,

    public readonly createdAt?: Date,

    public readonly roomName?: string | null,

  ) {}

}

