import { Inject } from '@nestjs/common';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Command } from 'src/common/application/Command';
import { ReposTokens } from 'src/common/Tokens';
import { ICompetitionPlain } from 'src/competitions/domain/entities/Competition.entity';
import type { ICompetitionRepository } from '../bounds/CompetitionRepository';
import { UserAndCompetitionService } from 'src/competitions/domain/services/UserAndCompetitionService';
import { ApiError, CompetitionErrors } from 'src/error/ApiError';

interface GetPrivateCompetitionByIdCommandInput {
  actor: UserEntity;
  competitionId: string;
}

export class GetPrivateCompetitionByIdCommand extends Command<
  GetPrivateCompetitionByIdCommandInput,
  ICompetitionPlain
> {
  @Inject(ReposTokens.CompetitionRepository)
  private readonly competitionRepository: ICompetitionRepository;
  async implementation(
    data: GetPrivateCompetitionByIdCommandInput,
  ): Promise<ICompetitionPlain> {
    UserAndCompetitionService.userHasAccessToSeePrivateCompetitions(data.actor);

    const competition = await this.competitionRepository.findById(
      data.competitionId,
    );

    if (!competition) ApiError.throw(CompetitionErrors.UNDEFINED);

    return competition.toJSON();
  }
}
