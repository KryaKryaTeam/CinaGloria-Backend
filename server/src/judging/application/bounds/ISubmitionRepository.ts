import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';
import { SubmitionEntity } from 'src/judging/domain/entities/Submition.entity';

export interface ISubmitionRepository {
  save(data: SubmitionEntity): Promise<void>;
  findById(id: string): Promise<SubmitionEntity | null>;
  findByRound(round: RoundEntity): Promise<SubmitionEntity[]>;
  delete(id: string): Promise<void>;
}
