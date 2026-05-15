import { Inject } from '@nestjs/common';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Query } from 'src/common/application/Query';
import { ReposTokens } from 'src/common/Tokens';
import { TeamEntity } from 'src/teams/domain/entities/Team.entity';
import type { ITeamRepository } from '../bounds/TeamRepository';
import { TeamStatus } from 'src/types/TeamStatus';

export interface ITeamSearchParams {
  name?: string;
  minMembers?: number;
  maxMembers?: number;
  isCaptain?: boolean;
  status?: TeamStatus;
  hasInvites?: boolean;
}

export interface GetMyTeamsPageInput {
  page: number;
  actor: UserEntity;
  searchParams: ITeamSearchParams;
}

export class GetMyTeamsPage extends Query<GetMyTeamsPageInput, TeamEntity[]> {
  @Inject(ReposTokens.TeamRepository)
  private readonly teamRepo: ITeamRepository;
  async implementation(data: GetMyTeamsPageInput): Promise<TeamEntity[]> {
    const teams = await this.teamRepo.findByMemberPage(
      data.actor.id,
      data.page,
      data.searchParams,
    );

    return teams;
  }
}
