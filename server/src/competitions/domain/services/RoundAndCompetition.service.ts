import { ApiError, RoundErrors, UserErrors } from 'src/error/ApiError';
import {
  CompetitionEntity,
  ICreateCompetition,
} from '../entities/Competition.entity';
import { RoundEntity, type ICreateRound } from '../entities/Round.entity';
import { ICreateTask, TaskEntity } from '../entities/Task.entity';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { RoleEnum } from 'src/types/RoleEnum';

export class RoundAndCompetitionService {
  static createRound(
    round: ICreateRound,
    competition: CompetitionEntity,
    user: UserEntity,
  ) {
    if (!(user.hasRole(RoleEnum.ADMIN) || user.hasRole(RoleEnum.ORGANIZER)))
      ApiError.throw(UserErrors.NOT_ENOUGH_RIGHTS);

    const valid = competition.rounds.every(
      (a) =>
        a.startOfRound > round.endOfRound || a.endOfRound < round.startOfRound,
    );

    if (!valid) ApiError.throw(RoundErrors.SPAN_IS_INVALID);

    const entity = RoundEntity.create(round);
    competition.addRound(entity);
    return entity;
  }

  static createCompetition(data: ICreateCompetition) {
    return CompetitionEntity.create(data);
  }

  static createTask(data: ICreateTask) {
    return TaskEntity.create(data);
  }

  static addTaskToRound(task: TaskEntity, round: RoundEntity) {
    round.addTask(task);
  }

  static addRoundToCompetition(
    round: RoundEntity,
    competition: CompetitionEntity,
  ) {
    competition.addRound(round);
  }

  static deleteRoundFromCompetition(
    round: RoundEntity,
    competition: CompetitionEntity,
  ) {
    competition.deleteRound(round);
  }
}
