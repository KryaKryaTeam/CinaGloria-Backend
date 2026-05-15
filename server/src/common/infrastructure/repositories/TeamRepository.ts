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
import { ITeamSearchParams } from 'src/teams/application/commands/GetMyTeamsPage.query';

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
    const schema = this.mapper.toSchema(ent);

    // Спробуємо оновити існуючий запис
    const result = await this.repository.update(schema.id, {
      name: schema.name,
      avatar: schema.avatar,
      banner: schema.banner,
      status: schema.status,
      captain: schema.captain,
      memberInvites: schema.memberInvites,
      registrationTimeout: schema.registrationTimeout,
      history: schema.history,
    });

    // Якщо нічого не оновилось (affected === 0), значить це нова команда — тоді save
    if (result.affected === 0) {
      await this.repository.save(schema);
    }
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
  async findByMemberPage(
    userId: string,
    page: number,
    searchParams: ITeamSearchParams,
  ): Promise<TeamEntity[]> {
    const query = this.repository
      .createQueryBuilder('team')
      .innerJoin('team.members', 'member')
      .leftJoinAndSelect('team.members', 'allMembers')
      .where('member.id = :userId', { userId });

    if (searchParams.name) {
      query.andWhere(
        '(team.name ILIKE :namePattern OR team.name % :nameInput)',
        {
          namePattern: `%${searchParams.name}%`,
          nameInput: searchParams.name,
        },
      );
      query.addSelect(`similarity(team.name, :nameInput)`, 'team_similarity');
      query.addOrderBy('team_similarity', 'DESC');
    }

    if (
      searchParams.minMembers !== undefined ||
      searchParams.maxMembers !== undefined
    ) {
      const subQuery = query
        .subQuery()
        .select('COUNT(tm.userId)')
        .from('UserRelTeamMember', 'tm')
        .where('tm.teamId = team.id')
        .getQuery();

      if (searchParams.minMembers !== undefined) {
        query.andWhere(`${subQuery} >= :min`, { min: searchParams.minMembers });
      }
      if (searchParams.maxMembers !== undefined) {
        query.andWhere(`${subQuery} <= :max`, { max: searchParams.maxMembers });
      }
    }
    if (searchParams.isCaptain !== undefined) {
      if (searchParams.isCaptain) {
        query.andWhere('team.captain::uuid = :userId', { userId });
      } else {
        query.andWhere('team.captain::uuid != :userId', { userId });
      }
    }

    if (searchParams.status) {
      query.andWhere('team.status = :status', { status: searchParams.status });
    }

    console.log(searchParams);

    if (searchParams.hasInvites !== undefined) {
      if (searchParams.hasInvites) {
        query.andWhere("team.memberInvites != '[]'::jsonb");
      } else {
        query.andWhere("team.memberInvites = '[]'::jsonb");
      }
    }

    // Default Sorting & Pagination
    const teams = await query
      .addOrderBy('team.createdAt', 'DESC')
      .skip(page * 20)
      .take(20)
      .getMany();

    return teams.map((sch) => this.mapper.toEntity(sch));
  }

  async delete(team: TeamEntity): Promise<void> {
    await this.repository.delete({ id: team.id });
  }
}
