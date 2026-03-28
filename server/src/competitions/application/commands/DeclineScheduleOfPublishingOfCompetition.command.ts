import { Inject } from '@nestjs/common';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Command } from 'src/common/application/Command';
import type { ICompetitionRepository } from '../bounds/CompetitionRepository';
import { ReposTokens } from 'src/common/Tokens';
import { UserAndCompetitionService } from 'src/competitions/domain/services/UserAndCompetitionService';
import { ApiError, CompetitionErrors } from 'src/error/ApiError';

interface CommandInput {
  user: UserEntity;
  competitionId: string;
}

export class DeclineScheduledPublishCommand extends Command<
  CommandInput,
  void
> {
  @Inject(ReposTokens.CompetitionRepository)
  private readonly competitionRepository: ICompetitionRepository;

  async implementation(data: CommandInput): Promise<void> {
    const competition = await this.competitionRepository.findById(
      data.competitionId,
    );

    if (!competition) ApiError.throw(CompetitionErrors.UNDEFINED);

    UserAndCompetitionService.declineSchedulePublishing(competition, data.user);

    await this.competitionRepository.save(competition);
  }
}
