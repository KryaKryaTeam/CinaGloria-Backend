import { Inject, Injectable } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import { SubmitionRepository } from 'src/common/infrastructure/repositories/SubmitionRepotisory';
import { ReposTokens } from 'src/common/Tokens';
import { ApiError, SubmitionErrors } from 'src/error/ApiError';
import { SubmissionService } from 'src/judging/domain/services/SubmissionService';
import { UpdateSubmitionDto } from 'src/judging/infrastructure/dtos/UpdateSubmition.dto';

@Injectable()
export class UpdateSubmissionCommand extends Command<UpdateSubmitionDto, void> {
  @Inject(ReposTokens.SubmitionRepository)
  private readonly submissionRepository: SubmitionRepository;

  async implementation(data: UpdateSubmitionDto): Promise<void> {
    const entity = await this.submissionRepository.findById(data.id);
    if (!entity) ApiError.throw(SubmitionErrors.SUBMITION_NOT_FOUND);

    if (!SubmissionService.canSubmit(entity))
      ApiError.throw(SubmitionErrors.CANNOT_SUBMIT);

    entity.githubURL = data.githubURL ?? entity.githubURL;
    entity.youtubeURL = data.youtubeURL ?? entity.youtubeURL;

    await this.submissionRepository.save(entity);
  }
}
