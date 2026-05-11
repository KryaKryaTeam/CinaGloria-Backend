import { Type } from 'class-transformer';
import { IsString, IsOptional } from 'class-validator';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { InternalFileLink } from 'src/files/infrastructure/decorators/InternalFileLink.decorator';

export class UpdateTeamDto {
  @InternalFileLink(false)
  @IsOptional()
  @IsString()
  @Type(
    () => (str: string) =>
      InternalFile.define<'team:avatar'>(str, 'team:avatar', 'team:avatar'),
  )
  avatar?: InternalFile<'team:avatar'>;

  @InternalFileLink(false)
  @IsOptional()
  @IsString()
  @Type(
    () => (str: string) =>
      InternalFile.define<'team:banner'>(str, 'team:banner', 'team:banner'),
  )
  banner?: InternalFile<'team:banner'>;

  @IsString()
  @IsOptional()
  name?: string;
}
