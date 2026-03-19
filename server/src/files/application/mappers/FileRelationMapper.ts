import { Mapper } from 'src/common/infrastructure/Mapper';
import { FileRelationEntity } from 'src/files/domain/entities/FileRelation.entity';
import { FileRelation } from 'src/schemas/FileRelation.schema';
import { FileMapper } from './FileMapper';
import { UserMapper } from 'src/authorization/application/mappers/UserMapper';
import { RelationString } from 'src/files/domain/objects/RelationSlots';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { MapperTokens } from 'src/common/Tokens';

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
  ) {
    super();
  }

  public toEntity(schema: FileRelation): FileRelationEntity {
    return FileRelationEntity.load({
      id: schema.id,
      file: this.fileMapper.toEntity(schema.file),
      slot: schema.slot ? RelationString.define(schema.slot) : undefined,
      user: schema.user ? this.userMapper.toEntity(schema.user) : undefined,
    });
  }

  public toSchema(entity: FileRelationEntity): FileRelation {
    if (!entity.filed)
      throw new BadRequestException('Relation is not ready for load!');

    const sch = new FileRelation();
    sch.id = entity.id;

    if (entity.file) {
      sch.file = this.fileMapper.toSchema(entity.file);
    }

    if (entity.user) {
      sch.user = this.userMapper.toSchema(entity.user);
      sch.user_id = entity.user.id;
    }

    sch.slot = entity.slot;

    return sch;
  }
}
