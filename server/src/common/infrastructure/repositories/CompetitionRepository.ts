import { CompetitionSchema } from 'src/schemas/Competition.schema';
import { BaseRepository } from './BaseRepository';
import { ICompetitionRepository } from 'src/competitions/application/bounds/CompetitionRepository';
import { CompetitionEntity } from 'src/competitions/domain/entities/Competition.entity';
import { Inject } from '@nestjs/common';
import { MapperTokens } from 'src/common/Tokens';
import { CompetitionMapper } from 'src/competitions/application/mapper/Competition.mapper';
import { CompetitionStatus } from 'src/types/CompetitionStatus';

export class CompetitionRepository
  extends BaseRepository<CompetitionSchema>
  implements ICompetitionRepository
{
  @Inject(MapperTokens.CompetitionMapper)
  private readonly mapper: CompetitionMapper;

  constructor() {
    super(CompetitionSchema); // Pass it up to the base
  }

  async save(ent: CompetitionEntity): Promise<void> {
    await this.repository.save(this.mapper.toSchema(ent));
  }

  async findById(id: string): Promise<CompetitionEntity | null> {
    const result = await this.repository.findOne({
      where: { id },
      relations: {
        rounds: {
          relatedTasks: true,
        },
        teams: {
          members: true,
        },
      },
    });
    if (!result) return null;

    return this.mapper.toEntity(result);
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  async getPage(pageNum: number): Promise<CompetitionEntity[]> {
    return (
      await this.repository.find({
        take: 20,
        skip: pageNum * 20,
        relations: {
          rounds: {
            relatedTasks: true,
          },
          teams: true,
        },
      })
    ).map((el) => this.mapper.toEntity(el));
  }

  async findAllEndedNotProcessed(): Promise<CompetitionEntity[]> {
    const compRaw = await this.repository
      .createQueryBuilder('competition')
      .setLock('pessimistic_write')
      .setOnLocked('skip_locked')
      .where('competition.dateOfEnd < :end', { end: new Date() })
      .andWhere('competition.status = :status', {
        status: CompetitionStatus.STARTED,
      })
      .getMany();
    return compRaw.map((ent) => this.mapper.toEntity(ent));
  }
  async findAllRegistrationEndedNotProcessed(): Promise<CompetitionEntity[]> {
    const compRaw = await this.repository
      .createQueryBuilder('competition')
      .setLock('pessimistic_write')
      .setOnLocked('skip_locked')
      .where('competition.dateOfEndRegistration < :end', { end: new Date() })
      .andWhere('competition.status = :status', {
        status: CompetitionStatus.REGISTRATION,
      })
      .getMany();
    return compRaw.map((ent) => this.mapper.toEntity(ent));
  }
  async findAllRegistrationStartedNotProcessed(): Promise<CompetitionEntity[]> {
    const compRaw = await this.repository
      .createQueryBuilder('competition')
      .setLock('pessimistic_write')
      .setOnLocked('skip_locked')
      .where('competition.dateOfStartRegistration < :end', { end: new Date() })
      .andWhere('competition.status = :status', {
        status: CompetitionStatus.PUBLISHED,
      })
      .getMany();
    return compRaw.map((ent) => this.mapper.toEntity(ent));
  }
  async findAllScheduledNotProcessed(): Promise<CompetitionEntity[]> {
    const compRaw = await this.repository
      .createQueryBuilder('competition')
      .setLock('pessimistic_write')
      .setOnLocked('skip_locked')
      .where('competition.publishedAt < :end', { end: new Date() })
      .andWhere('competition.status = :status', {
        status: CompetitionStatus.SCHEDULED,
      })
      .getMany();
    return compRaw.map((ent) => this.mapper.toEntity(ent));
  }
  async findAllStartedNotProcessed(): Promise<CompetitionEntity[]> {
    const compRaw = await this.repository
      .createQueryBuilder('competition')
      .setLock('pessimistic_write')
      .setOnLocked('skip_locked')
      .where('competition.dateOfStart < :end', { end: new Date() })
      .andWhere('competition.status = :status', {
        status: CompetitionStatus.WAITING_FOR_START,
      })
      .getMany();
    return compRaw.map((ent) => this.mapper.toEntity(ent));
  }
}
