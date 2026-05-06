import { Inject, Injectable } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import { SubmitionRepository } from 'src/common/infrastructure/repositories/SubmitionRepotisory';
import { ReposTokens } from 'src/common/Tokens';
import { ApiError, SubmitionErrors } from 'src/error/ApiError';
import { SubmitionEntity } from 'src/judging/domain/entities/Submition.entity';

@Injectable()
export class FindSubmissionByIdCommand extends Command<
  string,
  SubmitionEntity
> {
  @Inject(ReposTokens.SubmitionRepository)
  private readonly submissionRepository: SubmitionRepository;

  async implementation(data: string): Promise<SubmitionEntity> {
    const submission = await this.submissionRepository.findById(data);
    if (!submission) ApiError.throw(SubmitionErrors.SUBMITION_NOT_FOUND);

    return submission;
  }
}
