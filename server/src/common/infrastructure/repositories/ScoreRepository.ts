import { Inject, Injectable } from '@nestjs/common';
import { MapperTokens } from 'src/common/Tokens';
import { ScoreMapper } from 'src/judging/appliaction/mapper/ScoreMapper';
import { BaseRepository } from './BaseRepository';
import { IScoreRepository } from 'src/judging/appliaction/bounds/IScoreRepotirory';
import { ScoreEntity } from 'src/judging/domain/entities/Score.entity';
import { ScoreSchema } from 'src/schemas/Score.schema';
import { ApiError, ScoreErrors } from 'src/error/ApiError';

@Injectable()
export class ScoreRepository
  extends BaseRepository<ScoreSchema>
  implements IScoreRepository
{
  @Inject(MapperTokens.ScoreMapper)
  mapper: ScoreMapper;

  protected _entitySchema: new () => ScoreSchema;

  async save(data: ScoreEntity): Promise<void> {
    await this.repository.save(this.mapper.toSchema(data));
  }

  async findById(id: string): Promise<ScoreEntity | null> {
    const schema = await this.repository.findOneBy({ id });
    if (!schema) ApiError.throw(ScoreErrors.SCORE_NOT_FOUND);
    return this.mapper.toEntity(schema);
  }
}
