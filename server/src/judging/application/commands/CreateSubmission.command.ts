import { Inject, Injectable } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import { SubmitionRepository } from 'src/common/infrastructure/repositories/SubmitionRepotisory';
import { ReposTokens } from 'src/common/Tokens';
import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';
import { SubmitionEntity } from 'src/judging/domain/entities/Submition.entity';
import { CreateSubmissionDto } from 'src/judging/infrastructure/dtos/CreateSubmission.dto';

@Injectable()
export class CreateSubmissionCommand extends Command<
  CreateSubmissionDto,
  void
> {
  @Inject(ReposTokens.SubmitionRepository)
  private readonly submissionRepository: SubmitionRepository;

  async implementation(data: CreateSubmissionDto): Promise<void> {
    const entity = SubmitionEntity.create({
      ...data,
      relatedRound: RoundEntity.load(data.relatedRound),
      assignedToJury: undefined,
    });

    await this.submissionRepository.save(entity);
  }
}
