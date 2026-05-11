import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { randomUUID } from 'crypto';

export class AddMemberDto {
  @ApiProperty({ example: randomUUID(), description: 'uuid of new member' })
  @IsUUID()
  @IsNotEmpty()
  memberId: string;
}
