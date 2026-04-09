import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class DeleteRoundDto {
  @ApiProperty({ example: 'dd13b28b-efbc-4217-8d56-5e308d41ac60' })
  @IsUUID()
  id: string;
}
