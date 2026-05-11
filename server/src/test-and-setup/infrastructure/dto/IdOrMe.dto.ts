import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { randomUUID } from 'crypto';

export class IdOrMeDto {
  @IsNotEmpty()
  @IsString()
  @Matches(
    /^(me|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i,
    {
      message: 'ID must be "me" or a valid UUID',
    },
  )
  @ApiProperty({
    examples: { me: 'me', uuid: randomUUID() },
    description: 'Me or uuid of requested user',
    default: 'me',
  })
  id: string;
}
