import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { CompetitionEntity } from 'src/competitions/domain/entities/Competition.entity';
import { ITeamRepository } from 'src/teams/application/bounds/TeamRepository';
import { TeamEntity } from 'src/teams/domain/entities/Team.entity';
import { BaseRepository } from './BaseRepository';
import { TeamSchema } from 'src/schemas/Team.schema';
import { Inject } from '@nestjs/common';
import { MapperTokens } from 'src/common/Tokens';
import { CompetitionMapper } from 'src/competitions/application/mapper/Competition.mapper';
import { UserMapper } from 'src/authorization/application/mappers/UserMapper';
import { TeamMapper } from 'src/teams/application/mappers/team.mapper';

export class TeamRepository
  extends BaseRepository<TeamSchema>
  implements ITeamRepository
{
  protected _entitySchema: new () => TeamSchema;

  @Inject(MapperTokens.TeamMapper) private readonly mapper: TeamMapper;
  @Inject(MapperTokens.CompetitionMapper)
  private readonly compMapper: CompetitionMapper;
  @Inject(MapperTokens.UserMapper) private readonly userMapper: UserMapper;
  private async wmFindById(id: string) {
    const finded = await this.repository.findOne({
      where: { id },
      relations: { activeCompetition: true, members: true },
    });
    if (!finded) return undefined;
    return finded;
  }
  async save(ent: TeamEntity): Promise<void> {
    await this.repository.save(this.mapper.toSchema(ent));
  }
  async findById(id: string): Promise<TeamEntity | undefined> {
    const finded = await this.repository.findOneBy({ id });
    if (!finded) return undefined;
    return this.mapper.toEntity(finded);
  }
  async getActiveCompetition(
    id: string,
  ): Promise<CompetitionEntity | undefined> {
    const team = await this.wmFindById(id);
    if (!team) return undefined;

    const comp = team.activeCompetition;
    if (!comp) return undefined;
    return this.compMapper.toEntity(comp);
  }
  async getAllSerializedMembers(id: string): Promise<UserEntity[]> {
    const team = await this.wmFindById(id);
    if (!team) return [];

    const members = team.members.map((sch) => this.userMapper.toEntity(sch));
    return members;
  }
  async findByMemberPage(userId: string, page: number): Promise<TeamEntity[]> {
    const teams = await this.repository.find({
      where: {
        members: {
          id: userId,
        },
      },
      take: 20,
      skip: page * 20,
      order: {
        createdAt: 'DESC',
      },
    });

    return teams.map((sch) => this.mapper.toEntity(sch));
  }
}
