import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUsernameReq {
  @IsString()
  @MinLength(5)
  @MaxLength(50)
  @ApiProperty({ type: 'string' })
  username: string;
}
