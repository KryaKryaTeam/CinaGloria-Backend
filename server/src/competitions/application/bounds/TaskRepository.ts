import { CompetitionEntity } from 'src/competitions/domain/entities/Competition.entity';
import { TaskEntity } from 'src/competitions/domain/entities/Task.entity';

export interface ITaskRepository {
  save(task: TaskEntity): Promise<void>;
  findById(id: string): Promise<TaskEntity | null>;
  deleteById(id: string): Promise<void>;
  findCompetitionByTaskId(taskId: string): Promise<CompetitionEntity | null>;
}
