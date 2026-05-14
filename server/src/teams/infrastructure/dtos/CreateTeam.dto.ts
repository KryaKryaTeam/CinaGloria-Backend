import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { InternalFileLink } from 'src/files/infrastructure/decorators/InternalFileLink.decorator';

export class CreateTeamDto {
  @InternalFileLink(true)
  @IsNotEmpty()
  @IsString()
  avatar: string;

  @InternalFileLink(true)
  @IsNotEmpty()
  @IsString()
  banner: string;

  @ApiProperty({ description: 'Name of team ( max 255 )' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
