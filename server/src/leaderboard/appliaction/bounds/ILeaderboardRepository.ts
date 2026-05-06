import { LeaderboardEntity } from 'src/leaderboard/domain/entities/Leaderboard.entity';

export interface ILeaderboardRepotisory {
  save(leaderboard: LeaderboardEntity): Promise<void>;
  findById(id: string): Promise<LeaderboardEntity | void>;
}
