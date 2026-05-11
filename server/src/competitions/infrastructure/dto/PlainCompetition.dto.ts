import { ApiProperty } from '@nestjs/swagger';
import { ICompetitionPlain } from 'src/competitions/domain/entities/Competition.entity';
import { CompetitionStatus } from 'src/types/CompetitionStatus';
import { CompetitionRuleDto } from './CompetitionRule.dto';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { CompetitionRule } from 'src/competitions/domain/objects/CompetitionRule.object';
import { CompetitionSettings } from 'src/competitions/domain/objects/CompetitionSettings';
import { IRoundPlain } from 'src/competitions/domain/entities/Round.entity';
import { ITeamPlain } from 'src/teams/domain/entities/Team.entity';

export class PlainCompetitionDto implements ICompetitionPlain {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'The unique identifier of the competition',
  })
  id: string;

  @ApiProperty({
    example: 'Summer Coding Cup',
    description: 'The display name of the competition',
    required: false,
  })
  name?: string;

  @ApiProperty({
    example: 'A high-stakes coding competition for seniors...',
    description: 'Full markdown-supported description of the event',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: 'https://s3.amazonaws.com/bucket/avatars/uuid.webp',
    description: 'Public URL to the competition avatar image',
    required: false,

    format: 'uri',
    type: 'string',
  })
  avatar?: InternalFile<'competition:avatar'>;

  @ApiProperty({
    example: 'https://cdn.example.com/banners/uuid.jpg',
    description: 'Public URL to the standard competition banner',
    required: false,

    format: 'uri',
    type: 'string',
  })
  banner?: InternalFile<'competition:banner'>;

  @ApiProperty({
    example: 'https://cdn.example.com/banners/wide-uuid.png',
    description:
      'Public URL to the ultra-wide banner for desktop hero sections',
    required: false,

    format: 'uri',
    type: 'string',
  })
  ultraWideBanner?: InternalFile<'competition:ultraWideBanner'>;

  @ApiProperty({
    example: 'https://cdn.example.com/social/og-uuid.png',
    description:
      'Public URL to the image optimized for social media OpenGraph tags',
    required: false,

    format: 'uri',
    type: 'string',
  })
  socialMedia?: InternalFile<'competition:socialMedia'>;

  @ApiProperty({
    example: '2026-06-01T10:00:00Z',
    description: 'The exact date and time when the competition starts',
    required: false,
  })
  dateOfStart?: Date;

  @ApiProperty({
    example: '2026-06-30T18:00:00Z',
    description: 'The exact date and time when the competition ends',
    required: false,
  })
  dateOfEnd?: Date;

  @ApiProperty({
    example: '2026-05-01T00:00:00Z',
    description: 'The opening date for participant registration',
    required: false,
  })
  dateOfStartRegistration?: Date;

  @ApiProperty({
    example: '2026-05-25T23:59:59Z',
    description: 'The deadline for participant registration',
    required: false,
  })
  dateOfEndRegistration?: Date;

  @ApiProperty({
    example: '2026-05-30T09:00:00Z',
    description:
      'The scheduled timestamp when the competition becomes visible to the public',
    required: false,
  })
  publishAt?: Date;

  @ApiProperty({
    enum: CompetitionStatus,
    example: CompetitionStatus.PUBLISHED,
    description: 'The current operational status of the competition',
    required: false,
  })
  status: CompetitionStatus;

  @ApiProperty({
    type: [CompetitionRuleDto],
    description:
      'A list of rules associated with the competition, including icons and descriptions',
    required: false,
  })
  rules: CompetitionRule[];

  @ApiProperty({
    example: '{...}',
    required: false,
    description: 'A settings of competition',
  })
  settings: CompetitionSettings;

  @ApiProperty({})
  rounds: IRoundPlain[];

  @ApiProperty({})
  teams: ITeamPlain[];
}
