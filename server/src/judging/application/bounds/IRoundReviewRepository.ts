import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';
import { RoundReviewEntity } from 'src/judging/domain/entities/RoundReview.entity';

export interface IRoundReviewRepository {
  findById(id: string): Promise<RoundReviewEntity | null>;
  save(review: RoundReviewEntity): Promise<void>;
  findByRound(round: RoundEntity): Promise<RoundReviewEntity[] | null>;
}
