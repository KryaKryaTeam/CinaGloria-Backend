import {
  CompetitionEntity,
  ICreateCompetition,
} from '../entities/Competition.entity';
import { RoundEntity, type ICreateRound } from '../entities/Round.entity';
import { TaskEntity } from '../entities/Task.entity';

export class RoundAndCompetitionService {
  createRound(data: ICreateRound) {
    return RoundEntity.create(data);
  }

  createCompetition(data: ICreateCompetition) {
    return CompetitionEntity.create(data);
  }

  addTaskToRound(task: TaskEntity, round: RoundEntity) {
    round.addTask(task);
  }

  addRoundToCompetition(round: RoundEntity, competition: CompetitionEntity) {
    competition.addRound(round);
  }

  deleteRoundFromCompetition(
    round: RoundEntity,
    competition: CompetitionEntity,
  ) {
    competition.deleteRound(round);
  }
}
