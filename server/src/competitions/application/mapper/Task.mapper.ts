import { Inject, Injectable } from '@nestjs/common';
import { Mapper } from 'src/common/infrastructure/Mapper';
import { TaskEntity } from 'src/competitions/domain/entities/Task.entity';
import { Color } from 'src/competitions/domain/objects/Color.object';
import { TaskSchema } from 'src/schemas/Task.schema';
import { RoundMapper } from './Round.mapper';
import { MapperTokens } from 'src/common/Tokens';

@Injectable()
export class TaskMapper extends Mapper<TaskSchema, TaskEntity> {
  @Inject(MapperTokens.RoundMapper)
  private readonly roundMapper: RoundMapper;

  public toEntity(schema: TaskSchema): TaskEntity {
    const colorObj = Color.define(schema.color);

    return TaskEntity.load({
      id: schema.id,
      name: schema.name,
      description: schema.description!,
      color: colorObj,
      round: this.roundMapper.toEntity(schema.round),
    });
  }

  public toSchema(entity: TaskEntity): TaskSchema {
    const schema = new TaskSchema();

    schema.id = entity.id;
    schema.name = entity.name;
    schema.description = entity.description;
    schema.color = entity.color.value;
    schema.round = this.roundMapper.toSchema(entity.round);

    return schema;
  }
}
