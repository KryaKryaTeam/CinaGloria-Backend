import { Injectable } from '@nestjs/common';
import { Mapper } from 'src/common/infrastructure/Mapper';
import { ScoreEntity } from 'src/judging/domain/entities/Score.entity';
import { ScoreSchema } from 'src/schemas/Score.schema';

@Injectable()
export class ScoreMapper extends Mapper<ScoreSchema, ScoreEntity> {
  public toEntity(schema: ScoreSchema): ScoreEntity {
    return ScoreEntity.load({
      id: schema.id,
      score: schema.score,
      task: schema.task,
      team: schema.team,
    });
  }

  public toSchema(entity: ScoreEntity): ScoreSchema {
    return {
      id: entity.id,
      score: entity._score,
      team: entity.team,
      task: entity.task,
    };
  }
}
