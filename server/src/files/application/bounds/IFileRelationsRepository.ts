import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { FileEntity } from 'src/files/domain/entities/File.entity';
import { FileRelationEntity } from 'src/files/domain/entities/FileRelation.entity';
import { RelationString } from 'src/files/domain/objects/RelationSlots';

export interface IFileRelationsRepository {
  save(relation: FileRelationEntity): Promise<void>;
  deleteFilesWithNoRelation(): Promise<void>;
  deleteRelation(relation: FileRelationEntity): Promise<void>;
  deleteRelationByUserAndScope(
    user: UserEntity,
    scope: RelationString,
  ): Promise<void>;
  findRelationByFile(file: FileEntity): Promise<FileRelationEntity | null>;
  findFileByRelation(relation: FileRelationEntity): Promise<FileEntity | null>;
  findFileByUserAndScope(
    user: UserEntity,
    scope: RelationString,
  ): Promise<FileEntity | null>;
}
