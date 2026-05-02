import { Inject } from '@nestjs/common';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Query } from 'src/common/application/Query';
import { ReposTokens } from 'src/common/Tokens';
import { TeamEntity } from 'src/teams/domain/entities/Team.entity';
import type { ITeamRepository } from '../bounds/TeamRepository';

interface Input {
  page: number;
  actor: UserEntity;
}

interface Output {
  teams: TeamEntity[];
}

export class GetMyTeamsPage extends Query<Input, Output> {
  @Inject(ReposTokens.TeamRepository)
  private readonly teamRepo: ITeamRepository;
  async implementation(data: Input): Promise<Output> {
    const teams = await this.teamRepo.findByMemberPage(
      data.actor.id,
      data.page,
    );

    return { teams };
  }
}
