import { TaskSchema } from 'src/schemas/Task.schema';
import { BaseRepository } from './BaseRepository';
import { ITaskRepository } from 'src/competitions/application/bounds/TaskRepository';
import { MapperTokens } from 'src/common/Tokens';
import { TaskMapper } from 'src/competitions/application/mapper/Task.mapper';
import { TaskEntity } from 'src/competitions/domain/entities/Task.entity';
import { Inject } from '@nestjs/common';
import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';
import { ApiError, TaskErrors } from 'src/error/ApiError';
import { RoundMapper } from 'src/competitions/application/mapper/Round.mapper';
import { CompetitionEntity } from 'src/competitions/domain/entities/Competition.entity';
import { CompetitionMapper } from 'src/competitions/application/mapper/Competition.mapper';

export class TaskRepository
  extends BaseRepository<TaskSchema>
  implements ITaskRepository
{
  constructor() {
    super(TaskSchema);
  }

  @Inject(MapperTokens.TaskMapper)
  private readonly mapper: TaskMapper;
  @Inject(MapperTokens.RoundMapper)
  private readonly roundMapper: RoundMapper;
  @Inject(MapperTokens.CompetitionMapper)
  private readonly competitionMapper: CompetitionMapper;

  async save(task: TaskEntity): Promise<void> {
    await this.repository.save(this.mapper.toSchema(task));
  }

  async findById(id: string): Promise<TaskEntity | null> {
    const task = await this.repository.findOneBy({ id });
    if (!task) throw new Error('Task not found');
    return this.mapper.toEntity(task);
  }

  async findRelatedRound(id: string): Promise<RoundEntity | null> {
    const task = await this.repository.findOne({
      where: { id },
      relations: ['round'],
    });
    if (!task) ApiError.throw(TaskErrors.TASK_NOT_FOUND);
    return this.roundMapper.toEntity(task.round);
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  async findCompetitionByTaskId(
    taskId: string,
  ): Promise<CompetitionEntity | null> {
    const task = await this.repository
      .createQueryBuilder('task')
      .innerJoinAndSelect('task.round', 'round')
      .innerJoinAndSelect('round.competition', 'competition')
      .where('task.id = :taskId', { taskId })
      .getOne();

    return task
      ? this.competitionMapper.toEntity(task.round.competition)
      : null;
  }
}
