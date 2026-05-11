import { TaskEntity } from 'src/competitions/domain/entities/Task.entity';

export interface ITaskRepository {
  save(task: TaskEntity): Promise<void>;
  findById(id: string): Promise<TaskEntity | null>;
}
