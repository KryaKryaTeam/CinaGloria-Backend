import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import {
  CompetitionEntity,
  ICreateCompetition,
} from '../entities/Competition.entity';
import { RoleEnum } from 'src/types/RoleEnum';
import { ApiError, CompetitionErrors } from 'src/error/ApiError';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { CompetitionStatus } from 'src/types/CompetitionStatus';

export interface ICompetitionChangeFields {
  name: string | null;
  description: string | null;
  avatar: InternalFile<'competition:avatar'> | null;
  banner: InternalFile<'competition:banner'> | null;
  ultraWideBanner: InternalFile<'competition:ultraWideBanner'> | null;
  socialMedia: InternalFile<'competition:socialMedia'> | null;
  dateOfStart: Date | null;
  dateOfEnd: Date | null;
  dateOfStartRegistration: Date | null;
  dateOfEndRegistration: Date | null;
}

export class UserAndCompetitionService {
  private static userCanEditCompetitions(user: UserEntity) {
    const allowedRoles: RoleEnum[] = [RoleEnum.ADMIN, RoleEnum.ORGANIZER];

    if (!allowedRoles.includes(user.role))
      ApiError.throw(CompetitionErrors.CANNOT_EDIT);
  }
  static createCompetition(data: ICreateCompetition, user: UserEntity) {
    UserAndCompetitionService.userCanEditCompetitions(user);
    return CompetitionEntity.create(data);
  }

  static editCompetition(
    competition: CompetitionEntity,
    data: ICompetitionChangeFields,
    user: UserEntity,
  ) {
    UserAndCompetitionService.userCanEditCompetitions(user);

    if (data.name) competition.name = data.name;
    if (data.description) competition.description = data.description;
    if (data.avatar) competition.avatar = data.avatar;
    if (data.banner) competition.banner = data.banner;
    if (data.ultraWideBanner)
      competition.ultraWideBanner = data.ultraWideBanner;
    if (data.socialMedia) competition.socialMedia = data.socialMedia;
    if (data.dateOfStart) competition.dateOfStart = data.dateOfStart;
    if (data.dateOfEnd) competition.dateOfEnd = data.dateOfEnd;
    if (data.dateOfStartRegistration)
      competition.dateOfStartRegistration = data.dateOfStartRegistration;
    if (data.dateOfEndRegistration)
      competition.dateOfEndRegistration = data.dateOfEndRegistration;
  }

  static schedulePublishing(
    competition: CompetitionEntity,
    date: Date,
    user: UserEntity,
  ) {
    this.userCanEditCompetitions(user);

    competition.schedule(date);
  }

  static declineSchedulePublishing(
    competition: CompetitionEntity,
    user: UserEntity,
  ) {
    this.userCanEditCompetitions(user);

    competition.declineScheduledPublish();
  }

  static publishCompetiton(competition: CompetitionEntity, user: UserEntity) {
    this.userCanEditCompetitions(user);

    competition.status = CompetitionStatus.PUBLISHED;
  }

  static deleteCompetition(competition: CompetitionEntity, user: UserEntity) {
    this.userCanEditCompetitions(user);

    if (competition.canBeDeleted == false)
      ApiError.throw(CompetitionErrors.CANNOT_DELETE);

    return competition.canBeDeleted;
  }

  static userHasAccessToSeePrivateCompetitions(user: UserEntity) {
    UserAndCompetitionService.userCanEditCompetitions(user);
    return true;
  }
}
