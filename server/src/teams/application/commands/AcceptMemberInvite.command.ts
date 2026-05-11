import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Command } from 'src/common/application/Command';
import { Inject } from '@nestjs/common';
import { ReposTokens } from 'src/common/Tokens';
import type { ITeamRepository } from '../bounds/TeamRepository';
import { ApiError, DomainErrors } from 'src/error/ApiError';

interface AcceptMemberInviteCommandInput {
  actor: UserEntity;
  teamId: string;
}

export class AcceptMemberInviteCommand extends Command<
  AcceptMemberInviteCommandInput,
  void
> {
  @Inject(ReposTokens.TeamRepository) teamRepo: ITeamRepository;
  async implementation(data: AcceptMemberInviteCommandInput): Promise<void> {
    const team = await this.teamRepo.findById(data.teamId);
    if (!team) ApiError.throw(DomainErrors.UNEXPECTED_VALUE);

    team.acceptInvite(data.actor.id);

    team.pullEvents(this.eventDispatcher);
    await this.teamRepo.save(team);
  }
}
