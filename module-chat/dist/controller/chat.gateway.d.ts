import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from "../service/chat.service";
import { ChatUserService } from "../service/chat-user.service";
import { ChatMessageCreatedEvent } from "../dtos/chat_message_created.event.dto";
import { WsReadMessageDto } from "../dtos/ws-read-message.dto";
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    private readonly chatService;
    private readonly chatUserService;
    private readonly logger;
    private readonly wsValidationPipe;
    server: Server;
    constructor(jwtService: JwtService, chatService: ChatService, chatUserService: ChatUserService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleSendMessage(body: unknown, client: Socket): Promise<void>;
    handleReadMessage(message: WsReadMessageDto, client: Socket): Promise<void>;
    handleJoinRoom(roomId: string, client: Socket): Promise<void>;
    handleLeaveRoom(body: unknown, client: Socket): Promise<void>;
    handleChatMessageCreated(event: ChatMessageCreatedEvent): void;
    private runWsSafe;
    private requireSessionUserId;
    private requireSessionUser;
    private toConnectErrorPayload;
}
