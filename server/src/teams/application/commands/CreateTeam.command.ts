import { Inject } from '@nestjs/common';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Command } from 'src/common/application/Command';
import { ReposTokens } from 'src/common/Tokens';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { TeamEntity } from 'src/teams/domain/entities/Team.entity';
import type { ITeamRepository } from '../bounds/TeamRepository';

interface CreateTeamCommandInput {
  user: UserEntity;
  teamData: {
    avatar: InternalFile<'team:avatar'>;
    banner: InternalFile<'team:banner'>;
    name: string;
  };
}
export interface CreateTeamCommandOutput {
  team: TeamEntity;
}

export class CreateTeamCommand extends Command<
  CreateTeamCommandInput,
  CreateTeamCommandOutput
> {
  @Inject(ReposTokens.TeamRepository) teamRepo: ITeamRepository;
  async implementation(
    data: CreateTeamCommandInput,
  ): Promise<CreateTeamCommandOutput> {
    const team = TeamEntity.create({ captain: data.user.id, ...data.teamData });

    team.pullEvents(this.eventDispatcher);

    await this.teamRepo.save(team);

    return { team };
  }
}
