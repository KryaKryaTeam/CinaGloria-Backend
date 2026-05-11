import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { randomUUID } from 'crypto';

export class RegistrationDto {
  @ApiProperty({
    example: randomUUID(),
    description: 'an id of competition to which tean wanna register',
  })
  @IsUUID()
  @IsNotEmpty()
  competitionId: string;
}
