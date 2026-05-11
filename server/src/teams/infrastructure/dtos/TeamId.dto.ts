import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { randomUUID } from 'crypto';

export class TeamIdDto {
  @ApiProperty({
    example: randomUUID(),
    description: 'uuid of team',
    name: 'teamId',
  })
  @IsNotEmpty()
  @IsUUID()
  teamId: string;
}
