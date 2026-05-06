import { Inject } from '@nestjs/common';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Command } from 'src/common/application/Command';
import { ReposTokens } from 'src/common/Tokens';
import type { ITeamRepository } from '../bounds/TeamRepository';
import type { IUserRepository } from 'src/authorization/application/bounds/IUserRepository';
import { ApiError, DomainErrors, TeamErrors } from 'src/error/ApiError';
import { TeamEntityHelperService } from 'src/teams/domain/services/TeamEntityHelper.service';

interface DeleteMemberCommandInput {
  teamId: string;
  targetId: string;
  actor: UserEntity;
}

export class DeleteMemberCommand extends Command<
  DeleteMemberCommandInput,
  void
> {
  @Inject(ReposTokens.TeamRepository)
  private readonly teamRepo: ITeamRepository;
  @Inject(ReposTokens.UserRepository)
  private readonly userRepo: IUserRepository;
  async implementation(data: DeleteMemberCommandInput): Promise<void> {
    const team = await this.teamRepo.findById(data.teamId);
    const user = await this.userRepo.findById(data.targetId);

    if (!team) ApiError.throw(TeamErrors.TEAM_UNDEFINED);
    if (!user) ApiError.throw(DomainErrors.UNEXPECTED_VALUE);

    TeamEntityHelperService.deleteMember(team, data.actor, user);

    team.pullEvents(this.eventDispatcher);
    await this.teamRepo.save(team);
  }
}
