import { CompetitionEntity } from 'src/competitions/domain/entities/Competition.entity';
import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';

export interface IRoundRepository {
  save(ent: RoundEntity): Promise<void>;
  findById(id: string): Promise<RoundEntity | null>;
  findFinishedRounds(): Promise<RoundEntity[] | null>;
  findRelatedCompetition(roundId: string): Promise<CompetitionEntity | null>;
  findAllEndedButNotProcessed(): Promise<RoundEntity[]>;
  findAllStartedButNotProcessed(): Promise<RoundEntity[]>;
  getParentCompetitionId(round: RoundEntity): Promise<string | null>;
  findAllTimedOut(): Promise<RoundEntity[]>;
}
