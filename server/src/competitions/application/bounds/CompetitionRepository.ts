import { CompetitionEntity } from 'src/competitions/domain/entities/Competition.entity';

export interface ICompetitionRepository {
  save(ent: CompetitionEntity): Promise<void>;
  findById(id: string): Promise<CompetitionEntity | null>;
}
