import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { TeamEntity } from '../entities/Team.entity';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { ApiError, DomainErrors } from 'src/error/ApiError';
import { CompetitionEntity } from 'src/competitions/domain/entities/Competition.entity';
import { TeamStatus } from 'src/types/TeamStatus';

export class TeamEntityHelperService {
  static checkRights(team: TeamEntity, actor: UserEntity) {
    if (!team.isCaptain(actor.id))
      ApiError.throw(DomainErrors.RESTRICTED_CHANGE);
  }
  static patchEntity(
    team: TeamEntity,
    data: {
      name?: string;
      avatar?: InternalFile<'team:avatar'>;
      banner?: InternalFile<'team:banner'>;
    },
    actor: UserEntity,
  ) {
    this.checkRights(team, actor);
    if (data.name) team.name = data.name;
    if (data.avatar) team.avatar = data.avatar;
    if (data.banner) team.banner = data.banner;
  }

  static inviteMember(team: TeamEntity, actor: UserEntity, target: UserEntity) {
    this.checkRights(team, actor);

    team.inviteMember(target.id);
  }

  static registerTeam(
    team: TeamEntity,
    actor: UserEntity,
    competition: CompetitionEntity,
  ) {
    this.checkRights(team, actor);

    competition.canAddTeam(team);
    team.startRegistration(competition.id);
  }

  static cancelRegistration(team: TeamEntity, actor: UserEntity) {
    this.checkRights(team, actor);

    team.cancelRegistration(actor.id);
  }
  static deleteMember(team: TeamEntity, actor: UserEntity, target: UserEntity) {
    this.checkRights(team, actor);

    team.deleteMember(actor.id, target.id);
  }

  static canDelete(team: TeamEntity, actor: UserEntity) {
    this.checkRights(team, actor);

    if (team.status !== TeamStatus.IDLE)
      ApiError.throw(DomainErrors.RESTRICTED_CHANGE);
  }

  static changeCaptain(
    team: TeamEntity,
    actor: UserEntity,
    target: UserEntity,
  ) {
    this.checkRights(team, actor);

    team.changeCaptain(actor.id, target.id);
  }
}
