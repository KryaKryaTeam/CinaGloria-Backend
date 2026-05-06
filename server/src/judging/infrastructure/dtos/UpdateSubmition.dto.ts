import { IsOptional, IsString } from 'class-validator';

export class UpdateSubmitionDto {
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  githubURL?: string;

  @IsOptional()
  @IsString()
  youtubeURL?: string;
}
