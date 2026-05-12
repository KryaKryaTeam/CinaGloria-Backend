import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsHexColor } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({
    description: 'The name of the task',
    example: 'Build Authentication API',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Detailed explanation of what needs to be done',
    example:
      'Implement JWT strategy, login/register endpoints, and password hashing.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'The identification color for the task (Hex format)',
    example: '#4F46E5',
  })
  @IsString()
  @IsHexColor()
  color: string;

  @ApiProperty({
    description: 'The unique ID of the round this task belongs to (UUID)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsString()
  roundId: string;
}
