import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { randomUUID } from 'crypto';

export class ChangeCaptainDto {
  @ApiProperty({ example: randomUUID(), description: 'An id of new captain' })
  @IsUUID()
  @IsNotEmpty()
  captain: string;
}
