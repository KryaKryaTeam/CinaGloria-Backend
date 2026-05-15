import { Mapper } from 'src/common/infrastructure/Mapper';
import { FileRelationEntity } from 'src/files/domain/entities/FileRelation.entity';
import { FileRelation } from 'src/schemas/FileRelation.schema';
import { FileMapper } from './FileMapper';
import { UserMapper } from 'src/authorization/application/mappers/UserMapper';
import { RelationString } from 'src/files/domain/objects/RelationSlots';
import { Injectable, Inject } from '@nestjs/common';
import { ApiError, FileErrors } from 'src/error/ApiError';
import { MapperTokens } from 'src/common/Tokens';
import { CompetitionMapper } from 'src/competitions/application/mapper/Competition.mapper';
import { TeamMapper } from 'src/teams/application/mappers/team.mapper';

@Injectable()
export class FileRelationMapper extends Mapper<
  FileRelation,
  FileRelationEntity
> {
  constructor(
    @Inject(MapperTokens.UserMapper)
    private readonly userMapper: UserMapper,
    @Inject(MapperTokens.FileMapper)
    private readonly fileMapper: FileMapper,
    @Inject(MapperTokens.CompetitionMapper)
    private readonly competitionMapper: CompetitionMapper,
    @Inject(MapperTokens.TeamMapper)
    private readonly teamMapper: TeamMapper,
  ) {
    super();
  }

  public toEntity(schema: FileRelation): FileRelationEntity {
    return FileRelationEntity.load({
      id: schema.id,
      file: this.fileMapper.toEntity(schema.file),
      slot: schema.slot ? RelationString.define(schema.slot) : undefined,
      user: schema.user ? this.userMapper.toEntity(schema.user) : undefined,
      competition: schema.competition
        ? this.competitionMapper.toEntity(schema.competition)
        : undefined,
      team: schema.team ? this.teamMapper.toEntity(schema.team) : undefined,
    });
  }

  public toSchema(entity: FileRelationEntity): FileRelation {
    if (!entity.filed) ApiError.throw(FileErrors.INCOMPLETE_RELATION);

    const sch = new FileRelation();
    sch.id = entity.id;

    if (entity.file) {
      sch.file = this.fileMapper.toSchema(entity.file);
    }

    if (entity.user) {
      sch.user = this.userMapper.toSchema(entity.user);
      sch.user_id = entity.user.id;
    }

    if (entity.competition) {
      sch.competition = this.competitionMapper.toSchema(entity.competition);
      sch.competition_id = entity.competition.id;
    }

    if (entity.team) {
      sch.team = this.teamMapper.toSchema(entity.team);
      sch.team_id = entity.team.id;
    }

    sch.slot = entity.slot;

    return sch;
  }
}
