import { Inject, Injectable } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import type { ICompetitionRepository } from '../bounds/CompetitionRepository';
import { ReposTokens } from 'src/common/Tokens';
import { RoundAndCompetitionService } from 'src/competitions/domain/services/RoundAndCompetition.service';
import { ApiError, CompetitionErrors, UserErrors } from 'src/error/ApiError';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { RoleEnum } from 'src/types/RoleEnum';
import { ICreateRound } from 'src/competitions/domain/entities/Round.entity';

interface CreateRoundCommandProps {
  user: UserEntity;
  competitionId: string;
  roundData: ICreateRound;
}

@Injectable()
export class CreateRoundCommand extends Command<CreateRoundCommandProps, void> {
  @Inject(ReposTokens.CompetitionRepository)
  private readonly competitionRepostiory: ICompetitionRepository;

  async implementation(data: CreateRoundCommandProps) {
    if (
      !(
        data.user.hasRole(RoleEnum.ADMIN) ||
        data.user.hasRole(RoleEnum.ORGANIZER)
      )
    )
      ApiError.throw(UserErrors.NOT_ENOUGH_RIGHTS);

    const competition = await this.competitionRepostiory.findById(
      data.competitionId,
    );
    if (!competition) ApiError.throw(CompetitionErrors.UNDEFINED);

    const round = RoundAndCompetitionService.createRound(
      data.roundData,
      competition,
      data.user,
    );

    competition.addRound(round);
    await this.competitionRepostiory.save(competition);
  }
}
