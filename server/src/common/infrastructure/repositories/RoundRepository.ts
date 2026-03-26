import { IRoundRepository } from 'src/competitions/application/bounds/RoundRepository';
import { BaseRepository } from './BaseRepository';
import { Inject } from '@nestjs/common';
import { MapperTokens } from 'src/common/Tokens';
import { RoundSchema } from 'src/schemas/Round.schema';
import { RoundMapper } from 'src/competitions/application/mapper/Round.mapper';
import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';

export class RoundRepository
  extends BaseRepository<RoundSchema>
  implements IRoundRepository
{
  protected _entitySchema: new () => RoundSchema = RoundSchema;

  @Inject(MapperTokens.RoundMapper)
  private readonly mapper: RoundMapper;

  async save(ent: RoundEntity): Promise<void> {
    await this.repository.save(this.mapper.toSchema(ent));
  }

  async findById(id: string): Promise<RoundEntity | null> {
    const round = await this.repository.findOneBy({ id });
    if (!round) return null;
    return this.mapper.toEntity(round);
  }
}
