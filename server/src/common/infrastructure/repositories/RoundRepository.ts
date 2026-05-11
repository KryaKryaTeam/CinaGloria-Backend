import { IRoundRepository } from 'src/competitions/application/bounds/RoundRepository';
import { BaseRepository } from './BaseRepository';
import { Inject } from '@nestjs/common';
import { MapperTokens } from 'src/common/Tokens';
import { RoundSchema } from 'src/schemas/Round.schema';
import { RoundMapper } from 'src/competitions/application/mapper/Round.mapper';
import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';
import { RoundStatus } from 'src/types/RoundStatus';
import { CompetitionEntity } from 'src/competitions/domain/entities/Competition.entity';
import { CompetitionMapper } from 'src/competitions/application/mapper/Competition.mapper';

export class RoundRepository
  extends BaseRepository<RoundSchema>
  implements IRoundRepository
{
  protected _entitySchema: new () => RoundSchema = RoundSchema;

  @Inject(MapperTokens.RoundMapper)
  private readonly mapper: RoundMapper;

  @Inject(MapperTokens.CompetitionMapper)
  private readonly competitionMapper: CompetitionMapper;

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

  async findFinishedRounds(): Promise<RoundEntity[] | null> {
    const schema = await this.repository
      .createQueryBuilder('round')
      .where('round.endOfRound < :now', { now: new Date() })
      .getMany();

    return schema.map((el) => {
      return this.mapper.toEntity(el);
    });
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  async findRelatedCompetition(
    roundId: string,
  ): Promise<CompetitionEntity | null> {
    const roundSchema = await this.repository.findOne({
      where: { id: roundId },
      relations: ['competition'],
    });

    if (!roundSchema) return null;

    return this.competitionMapper.toEntity(roundSchema.competition);
  }

  async findAllTimedOut(): Promise<RoundEntity[]> {
    const schema = await this.repository
      .createQueryBuilder('round')
      .where('round.taskTimeout < :now', { now: new Date() })
      .getMany();

    return schema.map((el) => this.mapper.toEntity(el));
  }
}
