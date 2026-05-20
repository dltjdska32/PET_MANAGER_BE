import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FindChatLogsReqDto {
  @IsString()
  roomId: string;

  @Type(() => Number)
  @IsNumber()
  size: number = 20;

  @IsOptional()
  @Type(() => Date)
  lastCreatedAt?: Date;

  @IsOptional()
  @IsString()
  lastId?: string;
}