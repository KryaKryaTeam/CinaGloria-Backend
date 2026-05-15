import { Mapper } from 'src/common/infrastructure/Mapper';
import { TeamSchema } from 'src/schemas/Team.schema';
import { TeamEntity } from 'src/teams/domain/entities/Team.entity';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { CompetitionSchema } from 'src/schemas/Competition.schema';
import { UserSchema } from 'src/schemas/User.schema';
import { forwardRef, Inject } from '@nestjs/common';
import { MapperTokens } from 'src/common/Tokens';
import { RoundMapper } from 'src/competitions/application/mapper/Round.mapper';

export class TeamMapper extends Mapper<TeamSchema, TeamEntity> {
  @Inject(forwardRef(() => MapperTokens.RoundMapper))
  private readonly roundMapper: RoundMapper;

  public toEntity(schema: TeamSchema): TeamEntity {
    return TeamEntity.load({
      ...schema,
      activeCompetition: schema.activeCompetition?.id,
      avatar: InternalFile.define<'team:avatar'>(
        schema.avatar,
        'team:avatar',
        'team:avatar',
      ),
      banner: InternalFile.define<'team:banner'>(
        schema.banner,
        'team:banner',
        'team:banner',
      ),
      members: schema.members.map((usr) => usr.id),
      round: schema.round ? this.roundMapper.toEntity(schema.round) : undefined,
    });
  }
  public toSchema(entity: TeamEntity): TeamSchema {
    const sch = new TeamSchema();
    sch.name = entity.name;
    sch.activeCompetition = entity.activeCompetition
      ? ({ id: entity.activeCompetition } as unknown as CompetitionSchema)
      : undefined;
    sch.avatar = (
      entity.avatar as unknown as InternalFile<'team:avatar'>
    ).value;
    sch.banner = (
      entity.banner as unknown as InternalFile<'team:banner'>
    ).value;
    sch.captain = entity.captain;
    sch.members = entity.members.map(
      (id) => ({ id: id }) as unknown as UserSchema,
    );
    sch.history = entity.history.map((el) => el.toJSON());
    sch.memberInvites = entity.invites;
    sch.registrationTimeout = entity.registrationTimeout as unknown as
      | Date
      | undefined;
    sch.id = entity.id;
    sch.status = entity.status;
    sch.round = entity.round
      ? this.roundMapper.toSchema(entity.round)
      : undefined;

    return sch;
  }
}
