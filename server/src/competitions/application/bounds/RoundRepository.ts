import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';

export interface IRoundRepository {
  save(ent: RoundEntity): Promise<void>;
  findById(id: string): Promise<RoundEntity | null>;
}
