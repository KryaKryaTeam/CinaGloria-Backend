import { Inject, Injectable } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import { RoundRepository } from 'src/common/infrastructure/repositories/RoundRepository';
import { RoundReviewRepository } from 'src/common/infrastructure/repositories/RoundReviewRepository';
import { ScoreRepository } from 'src/common/infrastructure/repositories/ScoreRepository';
import { SubmitionRepository } from 'src/common/infrastructure/repositories/SubmitionRepotisory';
import { ReposTokens } from 'src/common/Tokens';
import { ApiError, RoundReviewErrors } from 'src/error/ApiError';
import { RoundReviewEntity } from 'src/judging/domain/entities/RoundReview.entity';
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
    if (!round) ApiError.throw(RoundReviewErrors.ROUND_NOT_FOUND);

    if (round.status != RoundStatus.ON_JUDGING)
      ApiError.throw(RoundReviewErrors.CANNOT_CREATE_REVIEW);

    const relatedScores = await Promise.all(
      data.relatedScores.map(async (score) => {
        const relatedScore = await this.scoreRepository.findById(score);
        if (!relatedScore)
          ApiError.throw(RoundReviewErrors.RELATED_SCORES_NOT_FOUND);
        return relatedScore;
      }),
    );

    const submission = await this.submissionRepository.findById(
      data.submission,
    );
    if (!submission) ApiError.throw(RoundReviewErrors.SUBMISSION_NOT_FOUND);

    const review = RoundReviewEntity.create({
      ...data,
      round,
      relatedScores,
      submission,
    });

    await this.roundReviewRepository.save(review);
  }
}
