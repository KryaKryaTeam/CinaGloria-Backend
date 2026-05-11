import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID } from 'class-validator';

export class CreateScoreDto {
  @IsNumber()
  @ApiProperty({
    example: 123,
    description: 'How much score the team got for this task',
  })
  score: number;

  @IsUUID()
  @ApiProperty({
    example: 'ded6b573-a280-486d-83eb-9e99718edf54',
    description: 'UUID of a team who got this specific score',
  })
  team: string;

  @IsUUID()
  @ApiProperty({
    example: 'c20b67f9-e2cb-4a12-9ecf-bae693c872ac',
    description: 'UUID of a task related to this score',
  })
  task: string;
}
