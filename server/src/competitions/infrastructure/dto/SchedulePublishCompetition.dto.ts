import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsDate } from 'class-validator';

export class SchedulePublishCompetitionDto {
  @ApiProperty({ example: '2026-08-30T12:00:00Z' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  publishAt: Date;
}
