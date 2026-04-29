import { SubmitionEntity } from 'src/task-collector/domain/entities/Submition.entity';

export interface ISubmitionRepository {
  save(data: SubmitionEntity): Promise<void>;
  findById(id: string): Promise<SubmitionEntity | null>;
}
