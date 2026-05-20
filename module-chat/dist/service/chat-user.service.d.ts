import { Connection } from "mongoose";
import { ChatUserRepo } from "../model/repo/chat-user.repo";
import { WsJoinRoomRespDto } from "../dtos/ws-join-room.resp.dto";
export declare class ChatUserService {
    private readonly chatUsersRepo;
    private readonly conn;
    private readonly logger;
    constructor(chatUsersRepo: ChatUserRepo, conn: Connection);
    findChatUserDocByUserId(userId: number): Promise<WsJoinRoomRespDto>;
}
