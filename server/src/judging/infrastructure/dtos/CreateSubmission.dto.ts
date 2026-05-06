import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { PlainRoundDto } from 'src/competitions/infrastructure/dto/PlainRound.dto';

export class CreateSubmissionDto {
  @ApiProperty({
    example: 'https://github.com/KryaKryaTeam/CinaGloria-Backend',
    description: "A Url to github project's repostiory",
  })
  @IsString()
  githubURL: string;

  @ApiProperty({
    example: 'http://youtube.com/watch?v=some-youtube-video-id',
    description: 'A link to a youtube video-presentation of a submission',
  })
  @IsString()
  youtubeURL: string;

  @ApiProperty({
    description: 'An array of tasks related to this submission',
  })
  @IsString()
  relatedRound: string;
}
