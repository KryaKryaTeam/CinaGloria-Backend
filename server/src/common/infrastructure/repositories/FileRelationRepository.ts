import { FileRelation } from 'src/schemas/FileRelation.schema';
import { BaseRepository } from './BaseRepository';
import { IFileRelationsRepository } from 'src/files/application/bounds/IFileRelationsRepository';
import { FileRelationEntity } from 'src/files/domain/entities/FileRelation.entity';
import { FileEntity } from 'src/files/domain/entities/File.entity';
import { Inject } from '@nestjs/common';
import { MapperTokens, ReposTokens } from 'src/common/Tokens';
import { FileRelationMapper } from 'src/files/application/mappers/FileRelationMapper';
import type { IFileRepository } from 'src/files/application/bounds/IFileRepository';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { RelationString } from 'src/files/domain/objects/RelationSlots';
import { FileMapper } from 'src/files/application/mappers/FileMapper';

export class FileRelationRepository
  extends BaseRepository<FileRelation>
  implements IFileRelationsRepository
{
  protected _entitySchema: new () => FileRelation = FileRelation;

  @Inject(MapperTokens.FileRelationMapper)
  private readonly fileRelationMapper: FileRelationMapper;

  @Inject(MapperTokens.FileMapper)
  private readonly fileMapper: FileMapper;

  @Inject(ReposTokens.FileRepository)
  private readonly fileRepository: IFileRepository;

  async save(relation: FileRelationEntity): Promise<void> {
    const schema = this.fileRelationMapper.toSchema(relation);
    await this.repository.save(schema);
  }

  async deleteRelation(relation: FileRelationEntity): Promise<void> {
    await this.repository.delete(relation.id);
  }

  async findRelationByFile(
    file: FileEntity,
  ): Promise<FileRelationEntity | null> {
    const relation = await this.repository.findOne({
      where: { file: { url: file.url } },
      relations: ['file', 'user'],
    });

    return relation ? this.fileRelationMapper.toEntity(relation) : null;
  }

  async findFileByUserAndScope(
    user: UserEntity,
    scope: RelationString,
  ): Promise<FileEntity | null> {
    const relation = await this.repository.findOne({
      where: {
        user_id: user.id,
        slot: scope.value,
      },
      relations: ['file'],
    });

    return relation ? this.fileRelationMapper.toEntity(relation).file : null;
  }

  async deleteFilesWithNoRelation(): Promise<void> {
    const activeRelations = await this.repository.find({ select: ['file'] });
    const activeUrls = activeRelations.map((r) => r.file.url);

    await this.fileRepository.deleteAllNonActiveByUrl(activeUrls);
  }

  async findFileByRelation(
    relation: FileRelationEntity,
  ): Promise<FileEntity | null> {
    const result = await this.repository.findOne({
      where: { id: relation.id },
      relations: ['file'],
    });

    if (!result) return null;

    return this.fileMapper.toEntity(result.file);
  }

  async deleteRelationByUserAndScope(
    user: UserEntity,
    scope: RelationString,
  ): Promise<void> {
    await this.repository.delete({
      user_id: user.id,
      slot: scope.value,
    });
  }
}
