import { Inject } from '@nestjs/common';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Command } from 'src/common/application/Command';
import { ReposTokens } from 'src/common/Tokens';
import type { ICompetitionRepository } from 'src/competitions/application/bounds/CompetitionRepository';
import type { ITeamRepository } from '../bounds/TeamRepository';
import { ApiError, CompetitionErrors, TeamErrors } from 'src/error/ApiError';
import { TeamEntityHelperService } from 'src/teams/domain/services/TeamEntityHelper.service';

interface RegisterTeamCommandInput {
  competitionId: string;
  teamId: string;
  actor: UserEntity;
}

export class RegisterTeamCommand extends Command<
  RegisterTeamCommandInput,
  void
> {
  @Inject(ReposTokens.CompetitionRepository)
  private readonly competitionRepository: ICompetitionRepository;
  @Inject(ReposTokens.TeamRepository)
  private readonly teamRepository: ITeamRepository;
  async implementation(data: RegisterTeamCommandInput): Promise<void> {
    const team = await this.teamRepository.findById(data.teamId);
    const competition = await this.competitionRepository.findById(
      data.competitionId,
    );

    if (!team) ApiError.throw(TeamErrors.TEAM_UNDEFINED);
    if (!competition) ApiError.throw(CompetitionErrors.UNDEFINED);

    TeamEntityHelperService.registerTeam(team, data.actor, competition);

    team.pullEvents(this.eventDispatcher);
    await this.teamRepository.save(team);
  }
}
