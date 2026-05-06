import { Inject, Injectable } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import { RoundRepository } from 'src/common/infrastructure/repositories/RoundRepository';
import { SubmitionRepository } from 'src/common/infrastructure/repositories/SubmitionRepotisory';
import { ReposTokens } from 'src/common/Tokens';
import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';
import { ApiError, RoundErrors } from 'src/error/ApiError';
import { SubmitionEntity } from 'src/judging/domain/entities/Submition.entity';
import { CreateSubmissionDto } from 'src/judging/infrastructure/dtos/CreateSubmission.dto';

@Injectable()
export class CreateSubmissionCommand extends Command<
  CreateSubmissionDto,
  void
> {
  @Inject(ReposTokens.SubmitionRepository)
  private readonly submissionRepository: SubmitionRepository;

  @Inject(ReposTokens.RoundRepository)
  private readonly roundRepository: RoundRepository;

  async implementation(data: CreateSubmissionDto): Promise<void> {
    const round = await this.roundRepository.findById(data.relatedRound);
    if (!round) ApiError.throw(RoundErrors.ROUND_NOT_FOUND);

    const entity = SubmitionEntity.create({
      ...data,
      relatedRound: RoundEntity.load(round),
      assignedToJury: undefined,
    });

    await this.submissionRepository.save(entity);
  }
}
