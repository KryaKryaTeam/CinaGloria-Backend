import { Inject, Injectable } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import { RoundRepository } from 'src/common/infrastructure/repositories/RoundRepository';
import { RoundReviewRepository } from 'src/common/infrastructure/repositories/RoundReviewRepository';
import { ReposTokens } from 'src/common/Tokens';
import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';
import { RoundAndCompetitionService } from 'src/competitions/domain/services/RoundAndCompetition.service';
import {
  ApiError,
  CompetitionErrors,
  RoundErrors,
  RoundReviewErrors,
} from 'src/error/ApiError';

@Injectable()
export class PullTeamsToNextRoundCommand extends Command<void, void> {
  @Inject(ReposTokens.RoundRepository)
  private readonly roundRepository: RoundRepository;

  @Inject(ReposTokens.RoundReviewRepository)
  private readonly roundReviewRepository: RoundReviewRepository;

  async implementation(): Promise<void> {
    const finishedRounds = await this.roundRepository.findFinishedRounds();
    if (!finishedRounds) return;

    finishedRounds.forEach(async (data) => {
      const competition = await this.roundRepository.findRelatedCompetition(
        data.id,
      );
      if (!competition) ApiError.throw(CompetitionErrors.COMPETITION_NOT_FOUND);

      const roundReviews = await this.roundReviewRepository.findByRound(data);
      if (!roundReviews)
        ApiError.throw(RoundReviewErrors.ROUND_REVIEW_NOT_FOUND);

      const teamsToPass = RoundAndCompetitionService.countTeamsToEnterNextRound(
        data,
        competition,
        roundReviews,
      );

      const finishedRoundIndex = competition.rounds.findIndex(
        (round) => round.id == data.id,
      );
      if (finishedRoundIndex == -1)
        return ApiError.throw(RoundErrors.ROUND_NOT_FOUND);
      if (finishedRoundIndex + 1 == competition.rounds.length) return; // means it was the last one

      const nextRound = competition.rounds[finishedRoundIndex + 1];
      teamsToPass.forEach((team) => {
        nextRound.addTeam(team);
      });

      await this.roundRepository.save(nextRound);
    });
  }
}
