import { Inject, Injectable } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import { RoundRepository } from 'src/common/infrastructure/repositories/RoundRepository';
import { ReposTokens } from 'src/common/Tokens';
import { ApiError, LeaderboardErrors, RoundErrors } from 'src/error/ApiError';
import { LeaderboardEntity } from 'src/leaderboard/domain/entities/Leaderboard.entity';

@Injectable()
export class GetLeaderboardCommand extends Command<string, LeaderboardEntity> {
  @Inject(ReposTokens.RoundRepository)
  private readonly roundRepository: RoundRepository;

  async implementation(data: string): Promise<LeaderboardEntity> {
    const round = await this.roundRepository.findById(data);
    if (!round) ApiError.throw(RoundErrors.ROUND_NOT_FOUND);

    const leaderboard = round.leaderboard;
    if (!round.leaderboard)
      ApiError.throw(LeaderboardErrors.LEADERBOARD_NOT_FOUND);

    return leaderboard;
  }
}
