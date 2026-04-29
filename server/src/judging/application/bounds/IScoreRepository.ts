import { ScoreEntity } from 'src/judging/domain/entities/Score.entity';

export interface IScoreRepository {
  save(data: ScoreEntity): Promise<void>;
  findById(id: string): Promise<ScoreEntity | null>;
}
