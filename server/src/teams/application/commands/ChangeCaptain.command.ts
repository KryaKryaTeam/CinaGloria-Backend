import { Inject } from '@nestjs/common';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Command } from 'src/common/application/Command';
import { ReposTokens } from 'src/common/Tokens';
import type { ITeamRepository } from '../bounds/TeamRepository';
import { ApiError, DomainErrors } from 'src/error/ApiError';
import { TeamEntityHelperService } from 'src/teams/domain/services/TeamEntityHelper.service';
import type { IUserRepository } from 'src/authorization/application/bounds/IUserRepository';

interface ChangeCaptainCommandInput {
  actor: UserEntity;
  target: string;
  teamId: string;
}

export class ChangeCaptainCommand extends Command<
  ChangeCaptainCommandInput,
  void
> {
  @Inject(ReposTokens.TeamRepository)
  private readonly teamRepo: ITeamRepository;

  @Inject(ReposTokens.UserRepository)
  private readonly userRepo: IUserRepository;
  async implementation(data: ChangeCaptainCommandInput): Promise<void> {
    const team = await this.teamRepo.findById(data.teamId);
    const target = await this.userRepo.findById(data.target);
    if (!team) ApiError.throw(DomainErrors.UNEXPECTED_VALUE);
    if (!target) ApiError.throw(DomainErrors.UNEXPECTED_VALUE);

    TeamEntityHelperService.changeCaptain(team, data.actor, target);
  }
}
