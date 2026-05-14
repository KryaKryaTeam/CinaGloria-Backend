import { Inject, Injectable } from '@nestjs/common';
import { ApiError, FileErrors } from 'src/error/ApiError';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { ReposTokens } from 'src/common/Tokens';
import { FileEntity } from 'src/files/domain/entities/File.entity';
import { FileRelationEntity } from 'src/files/domain/entities/FileRelation.entity';
import { RelationSlots } from 'src/types/RelationSlots';
import type { IFileRelationsRepository } from '../bounds/IFileRelationsRepository';
import { RelationString } from 'src/files/domain/objects/RelationSlots';
import { CompetitionEntity } from 'src/competitions/domain/entities/Competition.entity';
import { TeamEntity } from 'src/teams/domain/entities/Team.entity';

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

  private async unlinkSlotFromTeam(team: TeamEntity, slot: RelationString) {
    if (slot.family !== 'team') ApiError.throw(FileErrors.ENTITY_MISMATCH);

    await this.relationRepository.deleteRelationByTeamAndScope(team, slot);
  }

  private async unlinkSlotFromCompetition(
    competition: CompetitionEntity,
    slot: RelationString,
  ) {
    if (slot.family !== 'competition')
      ApiError.throw(FileErrors.ENTITY_MISMATCH);

    await this.relationRepository.deleteRelationByCompetitionAndScope(
      competition,
      slot,
    );
  }

  async linkAvatarToUser(file: FileEntity, user: UserEntity) {
    await this.unlinkAvatarFromUser(user);

    const relation = FileRelationEntity.create(file);

    relation.user = user;
    relation.slot = RelationSlots.user.avatar;

    await this.relationRepository.save(relation);
  }

  async linkFileToCompetitionSlot(
    file: FileEntity,
    competition: CompetitionEntity,
    slot: RelationString,
  ) {
    await this.unlinkSlotFromCompetition(competition, slot);

    const relation = FileRelationEntity.create(file);

    relation.competition = competition;
    relation.slot = slot;

    await this.relationRepository.save(relation);
  }

  async linkFileToTeamSlot(
    file: FileEntity,
    team: TeamEntity,
    slot: RelationString,
  ) {
    await this.unlinkSlotFromTeam(team, slot);

    const relation = FileRelationEntity.create(file);
    relation.team = team;
    relation.slot = slot;

    await this.relationRepository.save(relation);
  }
}
