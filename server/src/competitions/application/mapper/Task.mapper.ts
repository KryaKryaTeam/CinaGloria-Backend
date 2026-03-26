import { Injectable } from '@nestjs/common';
import { Mapper } from 'src/common/infrastructure/Mapper';
import { TaskEntity } from 'src/competitions/domain/entities/Task.entity';
import { Color } from 'src/competitions/domain/objects/Color.object';
import { TaskSchema } from 'src/schemas/Task.schema';

@Injectable()
export class TaskMapper extends Mapper<TaskSchema, TaskEntity> {
  public toEntity(schema: TaskSchema): TaskEntity {
    const colorObj = Color.define(schema.color);

    return TaskEntity.load({
      id: schema.id,
      name: schema.name,
      description: schema.description!,
      color: colorObj,
    });
  }

  public toSchema(entity: TaskEntity): TaskSchema {
    const schema = new TaskSchema();

    schema.id = entity.id;
    schema.name = entity.name;
    schema.description = entity.description;
    schema.color = entity.color.value;

    return schema;
  }
}
