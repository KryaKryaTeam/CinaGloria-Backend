import { Inject } from '@nestjs/common';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Command } from 'src/common/application/Command';
import { ReposTokens } from 'src/common/Tokens';
import type { ITeamRepository } from '../bounds/TeamRepository';
import { ApiError, DomainErrors } from 'src/error/ApiError';
import { TeamEntityHelperService } from 'src/teams/domain/services/TeamEntityHelper.service';

interface DeleteTeamCommandInput {
  teamId: string;
  actor: UserEntity;
}

export class DeleteTeamCommand extends Command<DeleteTeamCommandInput, void> {
  @Inject(ReposTokens.TeamRepository) teamRepo: ITeamRepository;
  async implementation(data: DeleteTeamCommandInput): Promise<void> {
    const team = await this.teamRepo.findById(data.teamId);
    if (!team) ApiError.throw(DomainErrors.UNEXPECTED_VALUE);

    TeamEntityHelperService.canDelete(team, data.actor);

    await this.teamRepo.delete(team);
  }
}
