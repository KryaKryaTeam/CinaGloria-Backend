import { Inject, Injectable } from '@nestjs/common';
import { Mapper } from 'src/common/infrastructure/Mapper';
import { SubmitionSchema } from 'src/schemas/Submition.schema';
import { SubmitionEntity } from 'src/judging/domain/entities/Submition.entity';
import { TaskMapper } from 'src/competitions/application/mapper/Task.mapper';
import { MapperTokens } from 'src/common/Tokens';

@Injectable()
export class SubmitionMapper extends Mapper<SubmitionSchema, SubmitionEntity> {
  @Inject(MapperTokens.TaskMapper)
  private readonly taskMapper: TaskMapper;

  public toEntity(schema: SubmitionSchema): SubmitionEntity {
    const tasks = schema.relatedTasks.map((task) =>
      this.taskMapper.toEntity(task),
    );
    return SubmitionEntity.load({
      id: schema.id,
      githubURL: schema.githubURL,
      youtubeURL: schema.youtubeURL,
      relatedTasks: tasks,
      assignedToJury: schema.assignedToJury,
      createdAt: schema.createdAt,
    });
  }

  public toSchema(entity: SubmitionEntity): SubmitionSchema {
    const tasks = entity.relatedTasks.map((task) =>
      this.taskMapper.toSchema(task),
    );
    return {
      id: entity.id,
      assignedToJury: entity.assignedToJury,
      githubURL: entity.githubURL,
      youtubeURL: entity.youtubeURL,
      relatedTasks: tasks,
      createdAt: entity.createdAt,
    };
  }
}
