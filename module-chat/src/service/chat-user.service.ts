import { Connection } from "mongoose";

import { HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { ChatUserRepo } from "src/model/repo/chat-user.repo";
import { WsJoinRoomRespDto } from "src/dtos/ws-join-room.resp.dto";
import { ChatException } from "src/config/exception/chat.exception";

@Injectable()
export class ChatUserService {
    private readonly logger = new Logger(ChatUserService.name);
    
  constructor(
    @Inject(ChatUserRepo) private readonly chatUsersRepo: ChatUserRepo,
    @InjectConnection() private readonly conn : Connection,
  ) {}


  async findChatUserDocByUserId(userId: number): Promise<WsJoinRoomRespDto> {

    const chatUserDoc = await this.chatUsersRepo.findChatUserDocumentByUserId(userId);

    if (!chatUserDoc) {
        throw new ChatException(
            HttpStatus.NOT_FOUND,
            'CHAT_ERR_04',
            '채팅 유저를 찾을 수 없습니다.',
        );
    }

    return new WsJoinRoomRespDto(Number(chatUserDoc.userId), chatUserDoc.username, chatUserDoc.userNickname);
  }

}