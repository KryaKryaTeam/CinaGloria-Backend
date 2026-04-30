import { Inject, Injectable } from '@nestjs/common';
import { Mapper } from 'src/common/infrastructure/Mapper';
import { MapperTokens } from 'src/common/Tokens';
import { RoundMapper } from 'src/competitions/application/mapper/Round.mapper';
import { LeaderboardEntity } from 'src/leaderboard/domain/entities/Leaderboard.entity';
import { LeaderboardSchema } from 'src/schemas/Leaderboard.schema';

@Injectable()
export class LeaderboardMapper extends Mapper<
  LeaderboardSchema,
  LeaderboardEntity
> {
  @Inject(MapperTokens.RoundMapper)
  private readonly roundMapper: RoundMapper;

  public toEntity(schema: LeaderboardSchema): LeaderboardEntity {
    return LeaderboardEntity.load({
      id: schema.id,
      nodes: schema.nodes,
      round: this.roundMapper.toEntity(schema.round),
    });
  }

  public toSchema(entity: LeaderboardEntity): LeaderboardSchema {
    return {
      id: entity.id,
      round: this.roundMapper.toSchema(entity.round),
      nodes: entity.nodes,
    };
  }
}
