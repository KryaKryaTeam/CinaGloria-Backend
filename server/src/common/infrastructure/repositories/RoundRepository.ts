import { IRoundRepository } from 'src/competitions/application/bounds/RoundRepository';
import { BaseRepository } from './BaseRepository';
import { Inject } from '@nestjs/common';
import { MapperTokens } from 'src/common/Tokens';
import { RoundSchema } from 'src/schemas/Round.schema';
import { RoundMapper } from 'src/competitions/application/mapper/Round.mapper';
import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';
import { LessThan } from 'typeorm';

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

  async findFinishedROunds(): Promise<RoundEntity[] | null> {
    const schema = await this.repository.findBy({
      endOfRound: LessThan(new Date()),
    });
    return schema.map((el) => {
      return this.mapper.toEntity(el);
    });
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}
