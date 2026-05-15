import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty } from 'class-validator';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { InternalFileLink } from 'src/files/infrastructure/decorators/InternalFileLink.decorator';

export class CreateTeamDto {
  @InternalFileLink(true)
  @IsNotEmpty()
  @IsString()
  @Type(
    () => (str: string) =>
      InternalFile.define<'team:avatar'>(str, 'team:avatar', 'team:avatar'),
  )
  avatar: InternalFile<'team:avatar'>;

  @InternalFileLink(true)
  @IsNotEmpty()
  @IsString()
  @Type(
    () => (str: string) =>
      InternalFile.define<'team:banner'>(str, 'team:banner', 'team:banner'),
  )
  banner: InternalFile<'team:banner'>;

  @ApiProperty({ description: 'Name of team ( max 255 )' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
