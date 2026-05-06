import { Inject } from '@nestjs/common';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Command } from 'src/common/application/Command';
import { ReposTokens } from 'src/common/Tokens';
import type { ITeamRepository } from '../bounds/TeamRepository';
import { ApiError, TeamErrors } from 'src/error/ApiError';
import { TeamEntityHelperService } from 'src/teams/domain/services/TeamEntityHelper.service';

interface CancelRegistrationOfTeamsCommandInput {
  teamId: string;
  actor: UserEntity;
}

export class CancelRegistrationOfTeamsCommand extends Command<
  CancelRegistrationOfTeamsCommandInput,
  void
> {
  @Inject(ReposTokens.TeamRepository)
  private readonly teamRepository: ITeamRepository;
  async implementation(
    data: CancelRegistrationOfTeamsCommandInput,
  ): Promise<void> {
    const team = await this.teamRepository.findById(data.teamId);
    if (!team) ApiError.throw(TeamErrors.TEAM_UNDEFINED);

    TeamEntityHelperService.cancelRegistration(team, data.actor);

    team.pullEvents(this.eventDispatcher);
    await this.teamRepository.save(team);
  }
}
