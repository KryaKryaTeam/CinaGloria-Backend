import { Inject, Injectable } from '@nestjs/common';
import { Mapper } from 'src/common/infrastructure/Mapper';
import { MapperTokens } from 'src/common/Tokens';
import { TaskMapper } from 'src/competitions/application/mapper/Task.mapper';
import { SubmitionEntity } from 'src/judging/domain/entities/Submition.entity';
import { SubmitionSchema } from 'src/schemas/Submition.schema';

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
    const sch = new SubmitionSchema();

    sch.id = entity.id;
    sch.assignedToJury = entity.assignedToJury;
    sch.githubURL = entity.githubURL;
    sch.youtubeURL = entity.youtubeURL;
    sch.relatedTasks = tasks;
    sch.createdAt = entity.createdAt;

    return sch;
  }
}
