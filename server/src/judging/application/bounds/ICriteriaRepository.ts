import { CriteriaEntity } from 'src/task-collector/domain/entities/Criteria.entity';

export interface ICriteriaRepotisory {
  save(criteria: CriteriaEntity): Promise<void>;
  findById(id: string): Promise<CriteriaEntity | void>;
}
