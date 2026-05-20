import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class FindChatRoomsReqDto {
  @Type(() => Number)
  @IsNumber()
  size: number = 20;


  @IsString()
  @IsOptional()
  lastRoomId?: string
  

  @IsOptional()
  @Type(() => Date)
  lastUpdatedAt?: Date;
}
