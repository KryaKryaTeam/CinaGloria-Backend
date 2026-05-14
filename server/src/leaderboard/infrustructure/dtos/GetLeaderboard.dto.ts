import { IsUUID } from 'class-validator';

export class GetLeaderboardDto {
  @IsUUID()
  roundId: string;
}
