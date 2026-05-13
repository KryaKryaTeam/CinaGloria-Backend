import { Inject, Injectable } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import { SubmitionRepository } from 'src/common/infrastructure/repositories/SubmitionRepotisory';
import { ReposTokens } from 'src/common/Tokens';
import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';
import { ApiError, LeaderboardErrors } from 'src/error/ApiError';
import { LeaderboardEntity } from 'src/leaderboard/domain/entities/Leaderboard.entity';
import {
  ILeaderboardNodeValue,
  LeaderboardNode,
} from 'src/leaderboard/domain/objects/LeaderboardNode.object';

@Injectable()
export class GenerateLeaderboardCommand extends Command<
  RoundEntity,
  LeaderboardEntity
> {
  @Inject(ReposTokens.SubmitionRepository)
  private readonly submissionRepository: SubmitionRepository;

  async implementation(data: RoundEntity): Promise<LeaderboardEntity> {
    const submissions = await this.submissionRepository.findByRound(data);
    const submissionsSortedByScore = submissions.sort(
      (a, b) => a.review!.summary - b.review!.summary,
    );

    const leaderboardNodes = submissionsSortedByScore.map((submission, i) => {
      if (!submission.review) ApiError.throw(LeaderboardErrors.NO_SUMMARY);
      const team = submission.team;
      const place = i + 1;
      const sumScore = submission.review.summary;
      const scores = submission.review.relatedScores;

      return LeaderboardNode.define({ team, place, sumScore, scores }).value;
    });

    return LeaderboardEntity.create({ nodes: leaderboardNodes, round: data });
  }
}
