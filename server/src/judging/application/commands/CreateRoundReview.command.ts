import { Inject, Injectable } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import { RoundRepository } from 'src/common/infrastructure/repositories/RoundRepository';
import { RoundReviewRepository } from 'src/common/infrastructure/repositories/RoundReviewRepository';
import { ScoreRepository } from 'src/common/infrastructure/repositories/ScoreRepository';
import { SubmitionRepository } from 'src/common/infrastructure/repositories/SubmitionRepotisory';
import { ReposTokens } from 'src/common/Tokens';
import {
  ApiError,
  RoundErrors,
  RoundReviewErrors,
  ScoreErrors,
  SubmitionErrors,
} from 'src/error/ApiError';
import { RoundReviewEntity } from 'src/judging/domain/entities/RoundReview.entity';
import { ScoreEntity } from 'src/judging/domain/entities/Score.entity';
import { CreateRoundReviewDto } from 'src/judging/infrastructure/dtos/CreateRoundReview.dto';
import { RoundStatus } from 'src/types/RoundStatus';

@Injectable()
export class CreateRoundReviewCommand extends Command<
  CreateRoundReviewDto,
  void
> {
  @Inject(ReposTokens.RoundReviewRepository)
  private readonly roundReviewRepository: RoundReviewRepository;

  @Inject(ReposTokens.ScoreRepository)
  private readonly scoreRepository: ScoreRepository;

  @Inject(ReposTokens.RoundRepository)
  private readonly roundRepository: RoundRepository;

  @Inject(ReposTokens.SubmitionRepository)
  private readonly submissionRepository: SubmitionRepository;

  async implementation(data: CreateRoundReviewDto): Promise<void> {
    const round = await this.roundRepository.findById(data.round);

    if (!round) ApiError.throw(RoundErrors.ROUND_NOT_FOUND);

    if (round.status !== RoundStatus.ON_JUDGING)
      ApiError.throw(RoundReviewErrors.CANNOT_CREATE_REVIEW);

    const submission = await this.submissionRepository.findById(
      data.submission,
    );

    if (!submission) ApiError.throw(SubmitionErrors.SUBMITION_NOT_FOUND);

    const loadedScores = await Promise.all(
      data.relatedScores.map(async (scoreId) => {
        const score = await this.scoreRepository.findById(scoreId);

        if (!score) ApiError.throw(ScoreErrors.SCORE_NOT_FOUND);

        return score;
      }),
    );

    // one score per task
    const scoresByTask = new Map<string, ScoreEntity>();

    for (const score of loadedScores) {
      const taskId = score.task.id;

      // duplicated score for same task
      if (scoresByTask.has(taskId))
        ApiError.throw(ScoreErrors.DUPLICATED_ROUND_SCORE);

      scoresByTask.set(taskId, score);
    }

    // ensure every round task has score
    for (const task of round.relatedTasks) {
      if (!scoresByTask.has(task.id)) {
        const zeroScore = ScoreEntity.create({
          score: 0,
          task,
          team: submission.team.id,
        });

        await this.scoreRepository.save(zeroScore);

        scoresByTask.set(task.id, zeroScore);
      }
    }

    const review = RoundReviewEntity.create({
      ...data,
      round,
      submission,
      relatedScores: [...scoresByTask.values()],
    });

    await this.roundReviewRepository.save(review);
  }
}
