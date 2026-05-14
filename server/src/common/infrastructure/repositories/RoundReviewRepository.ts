import { Inject, Injectable } from '@nestjs/common';
import { BaseRepository } from './BaseRepository';
import { RoundReviewSchema } from 'src/schemas/RoundReview.schema';
import { IRoundReviewRepository } from 'src/judging/application/bounds/IRoundReviewRepository';
import { RoundReviewEntity } from 'src/judging/domain/entities/RoundReview.entity';
import { MapperTokens } from 'src/common/Tokens';
import { RoundReviewMapper } from 'src/judging/application/mappers/RoundReviewMapper';

@Injectable()
export class RoundReviewRepository
  extends BaseRepository<RoundReviewSchema>
  implements IRoundReviewRepository
{
  protected _entitySchema: new () => RoundReviewSchema = RoundReviewSchema;

  @Inject(MapperTokens.RoundReviewMapper)
  private readonly mapper: RoundReviewMapper;

  async findById(id: string): Promise<RoundReviewEntity | null> {
    const result = await this.repository.findOneBy({ id });
    if (!result) return null;

    return this.mapper.toEntity(result);
  }

  async save(review: RoundReviewEntity): Promise<void> {
    await this.repository.save(this.mapper.toSchema(review));
  }
}
