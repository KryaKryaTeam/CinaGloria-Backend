import { Inject } from '@nestjs/common';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Command } from 'src/common/application/Command';
import { ReposTokens } from 'src/common/Tokens';
import type { ITeamRepository } from '../bounds/TeamRepository';
import type { IUserRepository } from 'src/authorization/application/bounds/IUserRepository';
import { ApiError, TeamErrors, UserErrors } from 'src/error/ApiError';
import { TeamEntityHelperService } from 'src/teams/domain/services/TeamEntityHelper.service';

interface InviteMemberCommandInput {
  actor: UserEntity;
  target: string;
  teamId: string;
}

export class InviteMemberCommand extends Command<
  InviteMemberCommandInput,
  void
> {
  @Inject(ReposTokens.TeamRepository) teamRepo: ITeamRepository;
  @Inject(ReposTokens.UserRepository) userRepo: IUserRepository;
  async implementation(data: InviteMemberCommandInput): Promise<void> {
    const team = await this.teamRepo.findById(data.teamId);
    if (!team) ApiError.throw(TeamErrors.TEAM_UNDEFINED);

    const target = await this.userRepo.findById(data.target);
    if (!target) ApiError.throw(UserErrors.USER_WITH_THIS_ID_UNDEFINED);

    TeamEntityHelperService.inviteMember(team, data.actor, target);

    team.pullEvents(this.eventDispatcher);
    await this.teamRepo.save(team);
  }
}
