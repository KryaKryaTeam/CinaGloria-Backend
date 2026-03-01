import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl } from 'class-validator';

export class UpdateAvatarReq {
  @IsUrl()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', format: 'uri' })
  avatar: string;
}
