import { ChatLogDocument, FileMeta, MessageType } from "src/model/chat-logs.schema";
import { ChatUserInfo } from "./chat-user-info.dto";

/**
 * GET /logs 의 FindChatLogsRespDto 와 동일한 필드명을 사용한다.
 * (WS new-message 수신 시 클라 모델 재사용)
 */
export class SendMessageRespDto {
  public roomId: string;
  public logid: string;
  public createdAt: Date;
  public sender: ChatUserInfo;
  public readUserIds: number[];
  public messageType: MessageType;
  public message?: string | null;
  public file?: FileMeta[];
  public isDeleted: boolean;
  public updatedAt: Date;

  constructor(chatLog: ChatLogDocument) {
    this.roomId = chatLog.roomId;
    this.logid = chatLog._id.toString();
    this.createdAt = chatLog.createdAt;
    this.sender = chatLog.sender;
    this.readUserIds = chatLog.readUserIds.map((user) => user.userId);
    this.messageType = chatLog.messageType;
    this.message = chatLog.message;
    this.file = chatLog.file;
    this.isDeleted = chatLog.isDeleted;
    this.updatedAt = chatLog.updatedAt;
  }
}
