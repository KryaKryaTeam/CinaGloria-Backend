import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { InternalFileLink } from 'src/files/infrastructure/decorators/InternalFileLink.decorator';

export class UpdateTeamDto {
  @InternalFileLink(false)
  @IsOptional()
  @IsString()
  avatar?: string;

  @InternalFileLink(false)
  @IsOptional()
  @IsString()
  banner?: string;

  @ApiProperty({ description: 'Name of team ( max 255 )', required: false })
  @IsString()
  @IsOptional()
  name?: string;
}
