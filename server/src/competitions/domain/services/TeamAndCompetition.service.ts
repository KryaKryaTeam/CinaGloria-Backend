import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { CompetitionEntity } from '../entities/Competition.entity';
import { RoleEnum } from 'src/types/RoleEnum';
import { ApiError, CompetitionErrors } from 'src/error/ApiError';
import { CompetitionStatus } from 'src/types/CompetitionStatus';

export class TeamAndCompetitionService {
  static canChange(actor: UserEntity, competition: CompetitionEntity) {
    const allowedRoles: RoleEnum[] = [RoleEnum.ADMIN, RoleEnum.ORGANIZER];

    if (!allowedRoles.includes(actor.role))
      ApiError.throw(CompetitionErrors.CANNOT_EDIT);
    if (competition.status != CompetitionStatus.DRAFT)
      ApiError.throw(CompetitionErrors.CANNOT_EDIT);
  }
}
