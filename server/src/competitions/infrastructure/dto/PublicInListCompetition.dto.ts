import { ApiProperty } from '@nestjs/swagger';
import { ICompetitionInList } from 'src/competitions/domain/entities/Competition.entity';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { CompetitionStatus } from 'src/types/CompetitionStatus';

export class PublicInListCompetitionDto implements ICompetitionInList {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'The unique identifier of the competition',
  })
  id: string;

  @ApiProperty({
    example: 'Global AI Hackathon',
    description: 'The display name of the competition',
  })
  name: string;

  @ApiProperty({
    example: 'https://s3.amazonaws.com/bucket/avatars/uuid.webp',
    description: 'Public URL to the competition avatar image',
    format: 'uri',
    type: 'string',
  })
  avatar: InternalFile<'competition:avatar'>;

  @ApiProperty({
    example: 'https://cdn.example.com/banners/uuid.jpg',
    description: 'Public URL to the standard competition banner',
    format: 'uri',
    type: 'string',
  })
  banner: InternalFile<'competition:banner'>;

  @ApiProperty({
    example: '2026-06-01T10:00:00Z',
    description: 'The timestamp when the competition event begins',
  })
  dateOfStart: Date;

  @ApiProperty({
    example: '2026-06-30T18:00:00Z',
    description: 'The timestamp when the competition event officially ends',
  })
  dateOfEnd: Date;

  @ApiProperty({
    example: '2026-05-01T00:00:00Z',
    description:
      'The timestamp when users can start registering for the competition',
  })
  dateOfStartRegistration: Date;

  @ApiProperty({
    example: '2026-05-25T23:59:59Z',
    description: 'The deadline for new participant registrations',
  })
  dateOfEndRegistration: Date;

  @ApiProperty({
    enum: CompetitionStatus,
    example: CompetitionStatus.PUBLISHED,
    description: 'The current operational status of the competition',
  })
  status: CompetitionStatus;
}
