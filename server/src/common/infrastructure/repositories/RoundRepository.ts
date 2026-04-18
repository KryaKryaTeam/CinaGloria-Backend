import { IRoundRepository } from 'src/competitions/application/bounds/RoundRepository';
import { BaseRepository } from './BaseRepository';
import { Inject } from '@nestjs/common';
import { MapperTokens } from 'src/common/Tokens';
import { RoundSchema } from 'src/schemas/Round.schema';
import { RoundMapper } from 'src/competitions/application/mapper/Round.mapper';
import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';
import { RoundStatus } from 'src/types/RoundStatus';

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

  async findAllEndedButNotProcessed(): Promise<RoundEntity[]> {
    const rounds = await this.repository
      .createQueryBuilder('round')
      .where('round.endOfRound < :now', { now: new Date() })
      .andWhere('round.status IN (:...statuses)', {
        statuses: [RoundStatus.IN_PROGRESS, RoundStatus.ON_JUDGING],
      })
      .getMany();
    return rounds.map((el) => this.mapper.toEntity(el));
  }
  async findAllStartedButNotProcessed(): Promise<RoundEntity[]> {
    const rounds = await this.repository
      .createQueryBuilder('round')
      .where('round.startOfRound < :now', { now: new Date() })
      .andWhere('round.status IN (:...statuses)', {
        statuses: [RoundStatus.CREATED],
      })
      .getMany();
    return rounds.map((el) => this.mapper.toEntity(el));
  }
  async getParentCompetitionId(round: RoundEntity): Promise<string | null> {
    const _round = await this.repository.findOne({ where: { id: round.id } });
    if (!_round) return null;

    return _round.competition.id;
  }
}
