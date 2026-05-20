import { ApiResponse } from '../config/api-response';
import type { BasicUserInfo } from '../config/auth/basic-user-info';
import { FindChatLogsReqDto } from '../dtos/find-chat-logs.req.dto';
import { ChatService } from '../service/chat.service';
import { JoinChatRoomReqDto } from "../dtos/join-chat-room.req.dto";
import { JoinChatRoomRespDto } from "../dtos/join-chat-room.resp.dto";
import { FindChatLogsRespDto } from "../dtos/find-chat-logs.resp.dto";
import { Slice } from "../config/slice";
import { FindChatRoomsReqDto } from "../dtos/find-chat-rooms.req.dto";
import { FindChatRoomsRespDto } from "../dtos/find-chat-rooms.resp.dto";
import { SendMessageReqDto } from "../dtos/send-message.req.dto";
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    private readonly logger;
    getChatLogs(user: BasicUserInfo, req: FindChatLogsReqDto): Promise<ApiResponse<Slice<FindChatLogsRespDto>>>;
    joinChatRoom(user: BasicUserInfo, req: JoinChatRoomReqDto): Promise<ApiResponse<JoinChatRoomRespDto>>;
    getChatRooms(user: BasicUserInfo, req: FindChatRoomsReqDto): Promise<ApiResponse<Slice<FindChatRoomsRespDto>>>;
    uploadFile(user: BasicUserInfo, req: SendMessageReqDto, files: Express.Multer.File[]): Promise<ApiResponse<null>>;
}
