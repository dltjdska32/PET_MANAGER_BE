import { Body, Controller, Get, Logger, Post, Query, UploadedFiles, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { ApiResponse } from '../config/api-response';
import type { BasicUserInfo } from '../config/auth/basic-user-info';
import { AuthUser } from '../config/auth/current-user.decorator';
import { FindChatLogsReqDto } from '../dtos/find-chat-logs.req.dto';
import { ChatService } from '../service/chat.service';
import { JoinChatRoomReqDto } from 'src/dtos/join-chat-room.req.dto';
import { JoinChatRoomRespDto } from 'src/dtos/join-chat-room.resp.dto';
import { FindChatLogsRespDto } from 'src/dtos/find-chat-logs.resp.dto';
import { Slice } from 'src/config/slice';
import { FindChatRoomsReqDto } from 'src/dtos/find-chat-rooms.req.dto';
import { FindChatRoomsRespDto } from 'src/dtos/find-chat-rooms.resp.dto';
import { SendMessageReqDto } from 'src/dtos/send-message.req.dto';
import { SendMessageRespDto } from 'src/dtos/send-message.resp.dto';
import { FilesInterceptor } from '@nestjs/platform-express/multer';
import { ChatException } from 'src/config/exception/chat.exception';

import { MessageType } from 'src/model/chat-logs.schema';



@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  private readonly logger = new Logger(ChatController.name);

  /// 채팅로그 조회
  @Get('logs')
  async getChatLogs(
    @AuthUser() user: BasicUserInfo,
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    req: FindChatLogsReqDto,
  ): Promise<ApiResponse<Slice<FindChatLogsRespDto>>> {

    this.logger.log('[getChatLogs] getChatLogs 호출 user: ', user.userId, ' roomId: ', req.roomId);
    const value: Slice<FindChatLogsRespDto> = await this.chatService.findChatLogs(user, req);
    return ApiResponse.pagination(value);
  }


  /// 채팅방 정보 조회 -> 채팅방 입장 or 생성후 입장
  @Post('/join') 
  async joinChatRoom(
    @AuthUser() user: BasicUserInfo,
    @Body() req: JoinChatRoomReqDto,
  ): Promise<ApiResponse<JoinChatRoomRespDto>> {

    this.logger.log('[joinChatRoom] req: ', req);
    
    const value: JoinChatRoomRespDto = await this.chatService.createOrGetChatRoom(
      user,
      req,
    );
    return ApiResponse.ok(value);
  }

  /// 채팅방 나가기 - ws사용
  // @Post('/leave')
  // async leaveChatRoom(
  //   @AuthUser() user: BasicUserInfo,
  //   @Body() req: LeaveChatRoomReqDto,
  // ): Promise<ApiResponse<void>> {
  //   await this.chatService.leaveChatRoom(Number(user.userId), req);
  //   return ApiResponse.ok();
  // }


  /// 유저가 참여한 채팅방 조회(커서 키셋방식 )
  @Get("/rooms")
  async getChatRooms(@AuthUser() user: BasicUserInfo, 
                      @Query(new ValidationPipe({ transform: true, whitelist: true }))
                      req: FindChatRoomsReqDto)
                      : Promise<ApiResponse<Slice<FindChatRoomsRespDto>>> {

    return ApiResponse.pagination(await this.chatService.findChatRooms(user, req));
  }


  /// 파일 업로드의 경우 http 파일 업로드 방식으로 처리 
  /// 요청 완료시 io.emit 을 통해 이벤트 발행
  @Post("/files/upload")
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadFile(
    @AuthUser() user: BasicUserInfo,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))  req: SendMessageReqDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {

    if (req.messageType !== MessageType.FILE) {
      throw ChatException.badRequest('파일 업로드 API입니다.');
    }

    await this.chatService.sendMessage(user, req, files);
    return ApiResponse.ok();

  }
 


}
