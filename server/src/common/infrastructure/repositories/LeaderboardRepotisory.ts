import { Inject, Injectable } from '@nestjs/common';
import { BaseRepository } from './BaseRepository';
import { LeaderboardSchema } from 'src/schemas/Leaderboard.schema';
import { ILeaderboardRepotisory } from 'src/leaderboard/appliaction/bounds/ILeaderboardRepository';
import { LeaderboardEntity } from 'src/leaderboard/domain/entities/Leaderboard.entity';
import { MapperTokens } from 'src/common/Tokens';
import { LeaderboardMapper } from 'src/leaderboard/appliaction/mapper/LeaderboardMapper';
import { ApiError, LeaderboardErrors } from 'src/error/ApiError';
import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';
import { RoundMapper } from 'src/competitions/application/mapper/Round.mapper';

@Injectable()
export class LeaderboardRepository
  extends BaseRepository<LeaderboardSchema>
  implements ILeaderboardRepotisory
{
  protected _entitySchema: new () => LeaderboardSchema;

  @Inject(MapperTokens.LeaderboardMapper)
  private readonly mapper: LeaderboardMapper;

  @Inject(MapperTokens.RoundMapper)
  private readonly roundMapper: RoundMapper;

  async save(leaderboard: LeaderboardEntity): Promise<void> {
    await this.repository.save(this.mapper.toSchema(leaderboard));
  }

  async findById(id: string): Promise<LeaderboardEntity | void> {
    const schema = await this.repository.findOneBy({ id });
    if (!schema) ApiError.throw(LeaderboardErrors.LEADERBOARD_NOT_FOUND);

    return this.mapper.toEntity(schema);
  }

  async findByRound(round: RoundEntity): Promise<LeaderboardEntity | void> {
    const schema = await this.repository.findOne({
      where: { round: this.roundMapper.toSchema(round) },
      relations: { round: true },
    });

    if (schema) return this.mapper.toEntity(schema);
  }
}
