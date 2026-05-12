import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { randomUUID } from 'crypto';

export class TaskIdDto {
  @ApiProperty({ example: randomUUID(), description: 'UUID of task' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  taskId: string;
}
