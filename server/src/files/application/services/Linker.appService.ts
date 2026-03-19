import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { ReposTokens } from 'src/common/Tokens';
import { FileEntity } from 'src/files/domain/entities/File.entity';
import { FileRelationEntity } from 'src/files/domain/entities/FileRelation.entity';
import { RelationSlots } from 'src/types/RelationSlots';
import type { IFileRelationsRepository } from '../bounds/IFileRelationsRepository';
import { RelationString } from 'src/files/domain/objects/RelationSlots';

@Injectable()
export class LinkerApplicationService {
  @Inject(ReposTokens.FileRelationRepository)
  private readonly relationRepository: IFileRelationsRepository;

  private async unlinkAvatarFromUser(user: UserEntity) {
    await this.relationRepository.deleteRelationByUserAndScope(
      user,
      RelationString.define(RelationSlots.user.avatar),
    );
  }

  async linkAvatarToUser(file: FileEntity, user: UserEntity) {
    await this.unlinkAvatarFromUser(user);

    const relationConfig = RelationString.define(
      RelationSlots.user.avatar,
    ).config;

    if (
      !relationConfig.allowedMimeTypes.includes(
        file.mimeType.value as `${string}/${string}`,
      )
    )
      throw new BadRequestException(
        "Mime type of the file aren't allowed for this slot!",
      );

    if (relationConfig.maxSize < file.size) {
      throw new BadRequestException('File is too big for this slot!');
    }

    const relation = FileRelationEntity.create(file);

    relation.user = user;
    relation.slot = RelationSlots.user.avatar;

    await this.relationRepository.save(relation);
  }
}
