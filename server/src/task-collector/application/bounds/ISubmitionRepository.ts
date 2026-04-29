import { SubmitionEntity } from '../../../judging/domain/entities/Submition.entity.ts';

export interface ISubmitionRepository {
  save(data: SubmitionEntity): Promise<void>;
  findById(id: string): Promise<SubmitionEntity | null>;
}
