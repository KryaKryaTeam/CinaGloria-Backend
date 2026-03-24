import { CompetitionSchema } from 'src/schemas/Competition.schema';
import { BaseRepository } from './BaseRepository';
import { ICompetitionRepository } from 'src/competitions/application/bounds/CompetitionRepository';
import { CompetitionEntity } from 'src/competitions/domain/entities/Competition.entity';
import { Inject } from '@nestjs/common';
import { MapperTokens } from 'src/common/Tokens';
import { CompetitionMapper } from 'src/competitions/application/mapper/Competition.mapper';

export class CompetitionRepository
  extends BaseRepository<CompetitionSchema>
  implements ICompetitionRepository
{
  protected _entitySchema: new () => CompetitionSchema = CompetitionSchema;

  @Inject(MapperTokens.CompetitionMapper)
  private readonly mapper: CompetitionMapper;

  async save(ent: CompetitionEntity): Promise<void> {
    await this.repository.save(this.mapper.toSchema(ent));
  }

  async findById(id: string): Promise<CompetitionEntity | null> {
    const result = await this.repository.findOneBy({ id });
    if (!result) return null;

    return this.mapper.toEntity(result);
  }
}
