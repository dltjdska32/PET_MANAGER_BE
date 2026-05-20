import { IsString } from "class-validator";

export class LeaveChatRoomReqDto {
    @IsString()
    public roomId: string;
}