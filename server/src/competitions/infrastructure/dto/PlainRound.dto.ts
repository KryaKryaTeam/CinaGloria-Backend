import { TaskEntity } from 'src/competitions/domain/entities/Task.entity';
import { Icons } from 'src/types/Icons';
import { RoundStatus } from 'src/types/RoundStatus';

export class PlainRoundDto {
  id: string;
  name: string;
  hidden: boolean;
  description: string;
  icon: Icons;
  startOfRound: Date;
  endOfRound: Date;
  taskTimeout: Date;
  relatedTasks: TaskEntity[];
  status: RoundStatus;
}
