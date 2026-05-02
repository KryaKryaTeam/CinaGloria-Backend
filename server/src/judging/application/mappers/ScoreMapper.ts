import { Inject, Injectable } from '@nestjs/common';
import { Mapper } from 'src/common/infrastructure/Mapper';
import { MapperTokens } from 'src/common/Tokens';
import { TaskMapper } from 'src/competitions/application/mapper/Task.mapper';
import { ScoreEntity } from 'src/judging/domain/entities/Score.entity';
import { ScoreSchema } from 'src/schemas/Score.schema';

@Injectable()
export class ScoreMapper extends Mapper<ScoreSchema, ScoreEntity> {
  @Inject(MapperTokens.TaskMapper)
  private readonly taskMapper: TaskMapper;

  public toEntity(schema: ScoreSchema): ScoreEntity {
    return ScoreEntity.load({
      id: schema.id,
      score: schema.score,
      task: this.taskMapper.toEntity(schema.task),
      team: schema.team,
    });
  }

  public toSchema(entity: ScoreEntity): ScoreSchema {
    const sch = new ScoreSchema();

    sch.id = entity.id;
    sch.score = entity._score;
    sch.team = entity.team;
    sch.task = this.taskMapper.toSchema(entity.task);

    return sch;
  }
}
