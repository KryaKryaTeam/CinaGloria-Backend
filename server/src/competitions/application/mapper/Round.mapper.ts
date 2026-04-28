import { Inject, Injectable } from '@nestjs/common';
import { Mapper } from 'src/common/infrastructure/Mapper';
import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';
import { RoundSchema } from 'src/schemas/Round.schema';
import { TaskMapper } from './Task.mapper';
import { MapperTokens } from 'src/common/Tokens';

@Injectable()
export class RoundMapper extends Mapper<RoundSchema, RoundEntity> {
  @Inject(MapperTokens.TaskMapper)
  private readonly taskMapper: TaskMapper;

  public toEntity(schema: RoundSchema) {
    const tasks = schema.relatedTasks.map((task) =>
      this.taskMapper.toEntity(task),
    );

    return RoundEntity.load({
      id: schema.id,
      name: schema.name,
      description: schema.description,
      startOfRound: schema.startOfRound,
      taskTimeout: schema.taskTimeout,
      endOfRound: schema.endOfRound,
      hidden: schema.hidden,
      icon: schema.icon,
      relatedTasks: tasks,
      status: schema.status,
    });
  }

  public toSchema(entity: RoundEntity): RoundSchema {
    const schema = new RoundSchema();

    schema.id = entity.id;
    schema.name = entity.name;
    schema.description = entity.description;
    schema.hidden = entity.hidden;
    schema.startOfRound = entity.startOfRound;
    schema.taskTimeout = entity.taskTimeout;
    schema.endOfRound = entity.endOfRound;
    schema.icon = entity.icon!;
    schema.status = entity.status;
    schema.relatedTasks = entity.relatedTasks.map((task) =>
      this.taskMapper.toSchema(task),
    );

    return schema;
  }
}
