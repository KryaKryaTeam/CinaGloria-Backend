import { Inject, Injectable } from '@nestjs/common';
import { BaseRepository } from './BaseRepository';
import { SubmitionSchema } from 'src/schemas/Submition.schema';
import { ISubmitionRepository } from 'src/task-collector/application/bounds/ISubmitionRepository';
import { MapperTokens } from 'src/common/Tokens';
import { SubmitionEntity } from 'src/task-collector/domain/entities/Submition.entity';
import { ApiError, SubmitionErrors } from 'src/error/ApiError';
import { SubmitionMapper } from 'src/task-collector/application/mappers/SubmitionMapper';

@Injectable()
export class SubmitionRepository
  extends BaseRepository<SubmitionSchema>
  implements ISubmitionRepository
{
  protected _entitySchema: new () => SubmitionSchema;

  @Inject(MapperTokens.SubmitionMapper)
  private readonly mapper: SubmitionMapper;

  async save(data: SubmitionEntity): Promise<void> {
    this.repository.save(this.mapper.toSchema(data));
  }

  async findById(id: string): Promise<SubmitionEntity | null> {
    const schema = await this.repository.findOneBy({ id });
    if (!schema) ApiError.throw(SubmitionErrors.SUBMITION_NOT_FOUND);

    return this.mapper.toEntity(schema);
  }
}
