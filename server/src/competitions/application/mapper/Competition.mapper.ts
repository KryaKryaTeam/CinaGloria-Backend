import { Inject, Injectable } from '@nestjs/common';
import { Mapper } from 'src/common/infrastructure/Mapper';
import { MapperTokens } from 'src/common/Tokens';
import { CompetitionEntity } from 'src/competitions/domain/entities/Competition.entity';
import { CompetitionRule } from 'src/competitions/domain/objects/CompetitionRule.object';
import { CompetitionSettings } from 'src/competitions/domain/objects/CompetitionSettings';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { CompetitionSchema } from 'src/schemas/Competition.schema';
import { RelationSlots } from 'src/types/RelationSlots';
import { RoundMapper } from './Round.mapper';
import { TeamMapper } from 'src/teams/application/team.mapper';

@Injectable()
export class CompetitionMapper extends Mapper<
  CompetitionSchema,
  CompetitionEntity
> {
  @Inject(MapperTokens.RoundMapper) private readonly roundMapper: RoundMapper;
  @Inject(MapperTokens.TeamMapper) private readonly teamMapper: TeamMapper;
  public toEntity(schema: CompetitionSchema): CompetitionEntity {
    return CompetitionEntity.load({
      id: schema.id,
      rounds: schema.rounds
        ? schema.rounds.map((sch) => this.roundMapper.toEntity(sch))
        : [],
      teams: schema.teams
        ? schema.teams.map((sch) => this.teamMapper.toEntity(sch).toJSON())
        : [],
      avatar: schema.avatar
        ? InternalFile.define<typeof RelationSlots.competition.avatar>(
            schema.avatar,
            'competition:avatar',
            'competition:avatar',
          )
        : undefined,
      settings: schema.settings[0]
        ? CompetitionSettings.fromPlain(schema.settings)
        : CompetitionSettings.createDefaults(),
      banner: schema.banner
        ? InternalFile.define<typeof RelationSlots.competition.banner>(
            schema.banner,
            'competition:banner',
            'competition:banner',
          )
        : undefined,
      dateOfEnd: schema.dateOfEnd,
      dateOfEndRegistration: schema.dateOfEndRegistration,
      dateOfStart: schema.dateOfStart,
      dateOfStartRegistration: schema.dateOfStartRegistration,
      description: schema.description,
      name: schema.name,
      rules: schema.rules
        ? schema.rules.map((el) =>
            CompetitionRule.define(el.name, el.description, el.icon),
          )
        : [],
      socialMedia: schema.socialMedia
        ? InternalFile.define<typeof RelationSlots.competition.socialMedia>(
            schema.socialMedia,
            'competition:socialMedia',
            'competition:socialMedia',
          )
        : undefined,
      status: schema.status,
      publishAt: schema.publishedAt,
      ultraWideBanner: schema.ultraWideBanner
        ? InternalFile.define<typeof RelationSlots.competition.ultraWideBanner>(
            schema.ultraWideBanner,
            'competition:ultraWideBanner',
            'competition:ultraWideBanner',
          )
        : undefined,
    });
  }
  public toSchema(entity: CompetitionEntity): CompetitionSchema {
    const schema = new CompetitionSchema();

    schema.id = entity.id;
    schema.name = entity.name;
    schema.description = entity.description;
    schema.dateOfStart = entity.dateOfStart;
    schema.dateOfStartRegistration = entity.dateOfStartRegistration;
    schema.dateOfEnd = entity.dateOfEnd;
    schema.dateOfEndRegistration = entity.dateOfEndRegistration;
    schema.banner =
      typeof entity.banner?.value === 'undefined'
        ? undefined
        : entity.banner.value;
    schema.ultraWideBanner =
      typeof entity.ultraWideBanner?.value === 'undefined'
        ? undefined
        : entity.ultraWideBanner.value;
    schema.avatar =
      typeof entity.avatar?.value === 'undefined'
        ? undefined
        : entity.avatar.value;
    schema.socialMedia =
      typeof entity.socialMedia?.value === 'undefined'
        ? undefined
        : entity.socialMedia.value;
    schema.status = entity.status;
    schema.publishedAt = entity.publishAt;
    schema.rules = entity.rules.map((el) => el.toJSON());
    schema.settings = entity.settings.toJSON();
    schema.rounds = entity.rounds
      ? entity.rounds.map((ent) => this.roundMapper.toSchema(ent))
      : [];
    schema.teams = entity.teams
      ? entity.teams.map((ent) => this.teamMapper.toSchema(ent))
      : [];
    return schema;
  }
}
