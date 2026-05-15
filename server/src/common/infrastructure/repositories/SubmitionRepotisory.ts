import { Inject, Injectable } from '@nestjs/common';
import { BaseRepository } from './BaseRepository';
import { SubmitionSchema } from 'src/schemas/Submition.schema';
import { ISubmitionRepository } from 'src/judging/application/bounds/ISubmitionRepository';
import { MapperTokens } from 'src/common/Tokens';
import { SubmitionEntity } from 'src/judging/domain/entities/Submition.entity';
import { ApiError, SubmitionErrors } from 'src/error/ApiError';
import { SubmitionMapper } from 'src/judging/application/mappers/SubmitionMapper';
import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';
import { RoundMapper } from 'src/competitions/application/mapper/Round.mapper';

@Injectable()
export class SubmitionRepository
  extends BaseRepository<SubmitionSchema>
  implements ISubmitionRepository
{
  protected _entitySchema: new () => SubmitionSchema;

  @Inject(MapperTokens.SubmitionMapper)
  private readonly mapper: SubmitionMapper;

  @Inject(MapperTokens.RoundMapper)
  private readonly roundMapper: RoundMapper;

  async save(data: SubmitionEntity): Promise<void> {
    this.repository.save(this.mapper.toSchema(data));
  }

  async findById(id: string): Promise<SubmitionEntity | null> {
    const schema = await this.repository.findOneBy({ id });
    if (!schema) ApiError.throw(SubmitionErrors.SUBMITION_NOT_FOUND);

    return this.mapper.toEntity(schema);
  }

  async findByRound(round: RoundEntity): Promise<SubmitionEntity[]> {
    const sch = await this.repository.find({
      where: {
        relatedRound: this.roundMapper.toSchema(round),
      },
      relations: { relatedRound: true },
    });

    return sch.map((el) => this.mapper.toEntity(el));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}
