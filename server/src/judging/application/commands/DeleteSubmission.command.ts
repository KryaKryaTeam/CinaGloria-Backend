import { Inject, Injectable } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import { SubmitionRepository } from 'src/common/infrastructure/repositories/SubmitionRepotisory';
import { ReposTokens } from 'src/common/Tokens';

@Injectable()
export class DeleteSubmissionCommand extends Command<string, void> {
  @Inject(ReposTokens.SubmitionRepository)
  private readonly submissionRepository: SubmitionRepository;

  async implementation(data: string): Promise<void> {
    await this.submissionRepository.delete(data);
  }
}
