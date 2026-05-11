import { IsNotEmpty, IsUUID } from 'class-validator';
import { TeamIdDto } from './TeamId.dto';
import { randomUUID } from 'crypto';
import { ApiProperty } from '@nestjs/swagger';

export class TeamMemberIdDto extends TeamIdDto {
  @ApiProperty({ example: randomUUID(), description: 'An id of member' })
  @IsUUID()
  @IsNotEmpty()
  memberId: string;
}
