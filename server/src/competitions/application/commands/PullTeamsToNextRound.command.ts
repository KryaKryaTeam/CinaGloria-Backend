import { Inject, Injectable } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import { RoundRepository } from 'src/common/infrastructure/repositories/RoundRepository';
import { ReposTokens } from 'src/common/Tokens';
import { RoundAndCompetitionService } from 'src/competitions/domain/services/RoundAndCompetition.service';
import { ApiError, CompetitionErrors, RoundErrors } from 'src/error/ApiError';
import { LeaderboardEntity } from 'src/leaderboard/domain/entities/Leaderboard.entity';

@Injectable()
export class PullTeamsToNextRoundCommand extends Command<
  LeaderboardEntity,
  void
> {
  @Inject(ReposTokens.RoundRepository)
  private readonly roundRepository: RoundRepository;

  async implementation(data: LeaderboardEntity): Promise<void> {
    const competition = await this.roundRepository.findRelatedCompetition(
      data.round.id,
    );
    if (!competition) ApiError.throw(CompetitionErrors.COMPETITION_NOT_FOUND);

    const finishedRoundIndex = competition.rounds.findIndex(
      (round) => round.id == data.round.id,
    );
    if (finishedRoundIndex == -1)
      ApiError.throw(RoundErrors.ROUND_NOT_IN_COMPETITION);
    if (finishedRoundIndex + 1 == competition.rounds.length) return;

    const nextRound = competition.rounds[finishedRoundIndex + 1];

    const teamsToPass = RoundAndCompetitionService.countTeamsToEnterNextRound(
      data.round,
      competition,
      data,
    );
    teamsToPass.forEach((team) => {
      nextRound.addTeam(team);
    });

    await this.roundRepository.save(nextRound);
  }
}
