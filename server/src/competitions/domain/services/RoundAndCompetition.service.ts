import {
  CompetitionEntity,
  ICreateCompetition,
} from '../entities/Competition.entity';
import { RoundEntity, type ICreateRound } from '../entities/Round.entity';

export class RoundAndCompetitionService {
  createRound(data: ICreateRound) {
    return RoundEntity.create(data);
  }

  createCompetition(data: ICreateCompetition) {
    return CompetitionEntity.create(data);
  }
}
