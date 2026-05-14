import { Inject, Injectable } from '@nestjs/common';
import { BaseRepository } from './BaseRepository';
import { ICriteriaRepotisory } from 'src/judging/application/bounds/ICriteriaRepository';
import { CriteriaEntity } from 'src/judging/domain/entities/Criteria.entity';
import { CriteriaSchema } from 'src/schemas/Criteria.schema';
import { MapperTokens } from 'src/common/Tokens';
import { CriteriaMapper } from 'src/judging/application/mappers/CriteriaMapper';
import { ApiError, CriteriaErrors } from 'src/error/ApiError';

@Injectable()
export class CriteriaRepository
  extends BaseRepository<CriteriaSchema>
  implements ICriteriaRepotisory
{
  @Inject(MapperTokens.CriteriaMapper)
  mapper: CriteriaMapper;

  protected _entitySchema: new () => CriteriaSchema;

  async save(criteria: CriteriaEntity): Promise<void> {
    await this.repository.save(this.mapper.toSchema(criteria));
  }

  async findById(id: string): Promise<CriteriaEntity | void> {
    const schema = await this.repository.findOneBy({ id });
    if (!schema) ApiError.throw(CriteriaErrors.CRITERIA_NOT_FOUND);

    return this.mapper.toEntity(schema);
  }
}
