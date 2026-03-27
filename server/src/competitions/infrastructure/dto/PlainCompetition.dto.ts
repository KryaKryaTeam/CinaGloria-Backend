import { ApiProperty } from '@nestjs/swagger';
import { ICompetitionPlain } from 'src/competitions/domain/entities/Competition.entity';
import { CompetitionStatus } from 'src/types/CompetitionStatus';
import { CompetitionRuleDto } from './CompetitionRule.dto';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { CompetitionRule } from 'src/competitions/domain/objects/CompetitionRule.object';

export class PlainCompetitionDto implements ICompetitionPlain {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'The unique identifier of the competition',
  })
  id: string;

  @ApiProperty({
    example: 'Summer Coding Cup',
    nullable: true,
    description: 'The display name of the competition',
  })
  name: string | null;

  @ApiProperty({
    example: 'A high-stakes coding competition for seniors...',
    nullable: true,
    description: 'Full markdown-supported description of the event',
  })
  description: string | null;

  @ApiProperty({
    example: 'https://s3.amazonaws.com/bucket/avatars/uuid.webp',
    description: 'Public URL to the competition avatar image',
    nullable: true,
    format: 'uri',
    type: 'string',
  })
  avatar: InternalFile<'competition:avatar'> | null;

  @ApiProperty({
    example: 'https://cdn.example.com/banners/uuid.jpg',
    description: 'Public URL to the standard competition banner',
    nullable: true,
    format: 'uri',
    type: 'string',
  })
  banner: InternalFile<'competition:banner'> | null;

  @ApiProperty({
    example: 'https://cdn.example.com/banners/wide-uuid.png',
    description:
      'Public URL to the ultra-wide banner for desktop hero sections',
    nullable: true,
    format: 'uri',
    type: 'string',
  })
  ultraWideBanner: InternalFile<'competition:ultraWideBanner'> | null;

  @ApiProperty({
    example: 'https://cdn.example.com/social/og-uuid.png',
    description:
      'Public URL to the image optimized for social media OpenGraph tags',
    nullable: true,
    format: 'uri',
    type: 'string',
  })
  socialMedia: InternalFile<'competition:socialMedia'> | null;

  @ApiProperty({
    example: '2026-06-01T10:00:00Z',
    nullable: true,
    description: 'The exact date and time when the competition starts',
  })
  dateOfStart: Date | null;

  @ApiProperty({
    example: '2026-06-30T18:00:00Z',
    nullable: true,
    description: 'The exact date and time when the competition ends',
  })
  dateOfEnd: Date | null;

  @ApiProperty({
    example: '2026-05-01T00:00:00Z',
    nullable: true,
    description: 'The opening date for participant registration',
  })
  dateOfStartRegistration: Date | null;

  @ApiProperty({
    example: '2026-05-25T23:59:59Z',
    nullable: true,
    description: 'The deadline for participant registration',
  })
  dateOfEndRegistration: Date | null;

  @ApiProperty({
    example: '2026-05-30T09:00:00Z',
    description:
      'The scheduled timestamp when the competition becomes visible to the public',
    nullable: true,
  })
  publishAt: Date | null;

  @ApiProperty({
    enum: CompetitionStatus,
    example: CompetitionStatus.PUBLISHED,
    description: 'The current operational status of the competition',
  })
  status: CompetitionStatus;

  @ApiProperty({
    type: [CompetitionRuleDto],
    description:
      'A list of rules associated with the competition, including icons and descriptions',
  })
  rules: CompetitionRule[];
}
