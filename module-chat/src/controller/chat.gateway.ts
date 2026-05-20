
import { HttpStatus, Logger, UseFilters, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
} from 'jsonwebtoken';

import {

  WebSocketGateway,

  WebSocketServer,

  SubscribeMessage,

  MessageBody,

  ConnectedSocket,

  OnGatewayConnection,

  OnGatewayDisconnect,

} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

import {

  emitWsException,

  WS_EXCEPTION_EVENT,

  WsExceptionFilter,

} from '../config/exception/ws-exception.filter';

import { ChatService } from 'src/service/chat.service';

import { ChatException } from 'src/config/exception/chat.exception';

import { BaseException } from 'src/config/exception/base.exception';

import { ApiResponse } from 'src/config/api-response';

import type {

  ChatAccessTokenPayload,

  ChatSocketSession,

} from 'src/types/chat-socket.types';

import { ChatUserService } from 'src/service/chat-user.service';

import { OnEvent } from '@nestjs/event-emitter';

import { SendMessageReqDto } from 'src/dtos/send-message.req.dto';

import { BasicUserInfo } from 'src/config/auth/basic-user-info';

import { MessageType } from 'src/model/chat-logs.schema';

import { CHAT_MESSAGE_CREATED, ChatMessageCreatedEvent } from 'src/dtos/chat_message_created.event.dto';

import { WsReadMessageDto } from 'src/dtos/ws-read-message.dto';
import { LeaveChatRoomReqDto } from 'src/dtos/leave-chat-room.req.dto';
import { ChatRoomLeftRespDto } from 'src/dtos/chat-room-left.resp.dto';



function toChatSession(decoded: ChatAccessTokenPayload): ChatSocketSession {

  return {

    userId: String(decoded.sub),

    userName: decoded.userName,

    userEmail: decoded.userEmail,

    userRole: decoded.userRole,

    exp: decoded.exp,
  };

}



@UseFilters(WsExceptionFilter)
@WebSocketGateway({

  namespace: '/chat',

  cors: {

    origin: '*',

    credentials: true,

  },

})

export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  private readonly logger = new Logger(ChatGateway.name);

  private readonly wsValidationPipe = new ValidationPipe({

    transform: true,

    whitelist: true,

  });



  @WebSocketServer()
  server: Server;



  constructor(

    private readonly jwtService: JwtService,

    private readonly chatService: ChatService,

    private readonly chatUserService: ChatUserService,

  ) {}

  async handleConnection(client: Socket) {

    try {

      const token =

        (client.handshake.auth as { token?: string })?.token ??

        client.handshake.headers.authorization?.replace(/^Bearer\s+/i, '');

      if (!token) {

        throw new ChatException(

          HttpStatus.UNAUTHORIZED,

          'CHAT_ERR_03',

          'UNAUTHORIZED',

        );

      }



      const decoded = await this.jwtService.verifyAsync<ChatAccessTokenPayload>(

        token,

      );



      if (decoded.sub === undefined || decoded.sub === null) {

        throw new ChatException(

          HttpStatus.UNAUTHORIZED,

          'CHAT_ERR_03',

          'UNAUTHORIZED',

        );

      }



      const session = toChatSession(decoded);

      const sockData = client.data as { session?: ChatSocketSession };

      sockData.session = session;

      console.log('WS ?? ??: userId = ', session.userId, ' clientId = ', client.id);

    } catch (err: unknown) {

      const payload = this.toConnectErrorPayload(err);

      client.emit(WS_EXCEPTION_EVENT, payload);

      client.disconnect(true);

    }

  }





   handleDisconnect(client: Socket) {

    const sockData = client.data as { session?: ChatSocketSession };

    if (sockData.session) {

      console.log('?? ?? ??: userId = ', sockData.session.userId, ' clientId = ', client.id);

      delete sockData.session;

    }

    console.log('?? ?? ??: clientId = ', client.id);

  }




  /// ??? ?? - TEXT ??? ??.
  @SubscribeMessage('send-message')
  async handleSendMessage(

    @MessageBody() body: unknown,

    @ConnectedSocket() client: Socket,

  ) {

    await this.runWsSafe(client, async () => {

      /// ?? ??.
      const dto = (await this.wsValidationPipe.transform(body, {

        type: 'body',

        metatype: SendMessageReqDto,

      })) as SendMessageReqDto;



      if (dto.messageType !== MessageType.TEXT) {

        throw ChatException.badRequest('INVALID_MESSAGE_TYPE');

      }



      const userInfo = this.requireSessionUser(client);

      await this.chatService.sendMessage(userInfo, dto);

      client.emit('send-message-success');

    });

  }



  @SubscribeMessage('read-message')

  async handleReadMessage(

    @MessageBody() message: WsReadMessageDto,

    @ConnectedSocket() client: Socket,

  ) {

    await this.runWsSafe(client, async () => {

      const userId = this.requireSessionUserId(client);

      await this.chatService.readMessage(Number(userId), message);

      client.emit('read-message-success');

    });

  }





  @SubscribeMessage('join-room')

  async handleJoinRoom(

    @MessageBody() roomId: string,

    @ConnectedSocket() client: Socket,

  ) {

    await this.runWsSafe(client, async () => {

      const userId = this.requireSessionUserId(client);

      await this.chatService.getValidatedChatRoom(Number(userId), roomId);

      await client.join(roomId);

      client.emit('join-room');

    });

  }





  @SubscribeMessage('leave-room')
  async handleLeaveRoom(

    @MessageBody() body: unknown,

    @ConnectedSocket() client: Socket,

  ) {

    await this.runWsSafe(client, async () => {

      /// ?? ??.
      const reqDto = (await this.wsValidationPipe.transform(body, {

        type: 'body',

        metatype: LeaveChatRoomReqDto,

      })) as LeaveChatRoomReqDto;
  
      const basicUserInfo = this.requireSessionUser(client);

      const leftUserInfo : ChatRoomLeftRespDto = await this.chatService
      .leaveChatRoom(Number(basicUserInfo.userId), reqDto);

      client.to(leftUserInfo.roomId)
      .emit('member-left', { userId: basicUserInfo.userId, 
        username: basicUserInfo.username });

      await client.leave(leftUserInfo.roomId);

      client.emit('leave-room-success', { roomId: leftUserInfo.roomId });

    });

  }



    /// ??? send ??  -> nest ?? publisher ?? 
    @OnEvent(CHAT_MESSAGE_CREATED, { async: true })
    handleChatMessageCreated(event: ChatMessageCreatedEvent) {

      try {

        this.logger.log(
          `[handleChatMessageCreated] roomId=${event.roomId} type=${event.payload.messageType} logid=${event.payload.logid}`,
        );

        this.server

          .to(event.roomId)

          .emit('new-message', { ...event.payload });

      } catch (err: unknown) {

        this.logger.error(

          `new-message broadcast failed roomId=${event.roomId}`,

          err instanceof Error ? err.stack : String(err),

        );

      }

    }



    /// try / catch ?? ??.
  private async runWsSafe(

    client: Socket,

    handler: () => Promise<void>,

  ): Promise<void> {

    try {

      await handler();

    } catch (err: unknown) {

      emitWsException(client, err, this.logger);

    }

  }



  private requireSessionUserId(client: Socket): string {

    const sockData = client.data as { session?: ChatSocketSession };

    const userId = sockData.session?.userId;

    if (userId === undefined || userId === null) {

      throw new ChatException(

        HttpStatus.UNAUTHORIZED,

        'CHAT_ERR_03',

        'UNAUTHORIZED',

      );

    }

    return userId;

  }



  /// ?????? BasicUserInfo ??.
  private requireSessionUser(client: Socket): BasicUserInfo {

    const sockData = client.data as { session?: ChatSocketSession };

    const session = sockData.session;

    if (!session) {

      throw new ChatException(

        HttpStatus.UNAUTHORIZED,

        'CHAT_ERR_03',

        'UNAUTHORIZED',

      );

    }

    return {

      userId: session.userId,

      username: session.userName ?? '',

      email: session.userEmail ?? '',

      role: session.userRole ?? '',

      accessTokenExpiresAt: session.exp ?? 0,

    };

  }



  private toConnectErrorPayload(err: unknown): ApiResponse<null> {

    if (err instanceof BaseException) {

      return ApiResponse.error(err.statusCode, err.code, err.message);

    }

    if (err instanceof TokenExpiredError) {

      return ApiResponse.error(

        HttpStatus.UNAUTHORIZED,

        'CHAT_JWT_EXPIRED',

        '??? ??? ???????.',

      );

    }

    if (err instanceof NotBeforeError) {

      return ApiResponse.error(

        HttpStatus.UNAUTHORIZED,

        'CHAT_JWT_NOT_ACTIVE',

        '?? ???? ?? ?????.',

      );

    }

    if (err instanceof JsonWebTokenError) {

      return ApiResponse.error(

        HttpStatus.UNAUTHORIZED,

        'CHAT_JWT_INVALID',

        '?? ??? ???? ????.',

      );

    }

    return ApiResponse.error(

      HttpStatus.INTERNAL_SERVER_ERROR,

      'INTERNAL_SERVER_ERR',

      '?? ?? ? ??? ??????.',

    );

  }







}


