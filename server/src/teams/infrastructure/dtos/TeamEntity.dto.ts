import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { InternalFileLink } from 'src/files/infrastructure/decorators/InternalFileLink.decorator';
import { ITeamHistoryPlain } from 'src/teams/domain/objects/TeamHistoryNode.object';
import { TeamStatus } from 'src/types/TeamStatus';

export class TeamHistoryDto implements ITeamHistoryPlain {
  @ApiProperty({
    example: 1,
    description: 'The finishing rank in the leaderboard',
  })
  placeInLeaderboard: number;

  @ApiProperty({
    example: 'round-uuid-123',
    description: 'The unique identifier of the round',
  })
  roundId: string;
}

export class MemberInviteDto {
  @ApiProperty({
    example: 'user-uuid-456',
    description: 'The ID of the invited member',
  })
  member: string;

  @ApiProperty({ example: true })
  forCompetition: boolean;

  @ApiPropertyOptional({
    example: 'comp-uuid-789',
    description: 'Required if forCompetition is true',
  })
  competition?: string;

  @ApiProperty({ example: false })
  accepted: boolean;
}

export class TeamEntityDto {
  @ApiProperty({ example: 'team-uuid-001' })
  id: string;

  @ApiPropertyOptional({ example: 'season-2024' })
  activeCompetition?: string;

  @InternalFileLink(false)
  @IsString()
  avatar: string;

  @InternalFileLink(false)
  @IsString()
  banner: string;

  @ApiProperty({ example: 'captain-user-id' })
  captain: string;

  @ApiProperty({
    type: [TeamHistoryDto],
    description: 'List of past team performances',
  })
  history: TeamHistoryDto[];

  @ApiProperty({
    type: [MemberInviteDto],
    description: 'Pending or active invites',
  })
  memberInvites: MemberInviteDto[];

  @ApiProperty({ example: ['user-1', 'user-2'], isArray: true })
  members: string[];

  @ApiProperty({ example: 'The Dream Team' })
  name: string;

  @ApiPropertyOptional({ example: '2026-05-02T17:00:00Z' })
  registrationTimeout?: Date;

  @ApiProperty({ enum: TeamStatus, example: TeamStatus.ACTIVE })
  status: TeamStatus;
}
