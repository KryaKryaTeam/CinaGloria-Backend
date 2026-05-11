import { Inject } from '@nestjs/common';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Command } from 'src/common/application/Command';
import { ReposTokens } from 'src/common/Tokens';
import type { ICompetitionRepository } from '../bounds/CompetitionRepository';
import { ApiError, CompetitionErrors } from 'src/error/ApiError';
import { UserAndCompetitionService } from 'src/competitions/domain/services/UserAndCompetitionService';
import { CompetitionSettings } from 'src/competitions/domain/objects/CompetitionSettings';

interface UpdateSettingsOfCompetitionCommandInput {
  settings: Record<string, unknown>;
  competitionId: string;
  user: UserEntity;
}

export class UpdateSettingsOfCompetitionCommand extends Command<
  UpdateSettingsOfCompetitionCommandInput,
  void
> {
  @Inject(ReposTokens.CompetitionRepository)
  private readonly competitionRepo: ICompetitionRepository;
  async implementation(
    data: UpdateSettingsOfCompetitionCommandInput,
  ): Promise<void> {
    const competition = await this.competitionRepo.findById(data.competitionId);
    if (!competition) ApiError.throw(CompetitionErrors.UNDEFINED);

    const settings = CompetitionSettings.fromPlain(data.settings);

    UserAndCompetitionService.chanegeSettingsOfCompetition(
      competition,
      data.user,
      settings,
    );

    await this.competitionRepo.save(competition);
  }
}
