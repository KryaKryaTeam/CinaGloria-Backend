import { Inject } from '@nestjs/common';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Command } from 'src/common/application/Command';
import { RoundRepository } from 'src/common/infrastructure/repositories/RoundRepository';
import { TaskRepository } from 'src/common/infrastructure/repositories/TaskRepository';
import { ReposTokens } from 'src/common/Tokens';
import { Color } from 'src/competitions/domain/objects/Color.object';
import { RoundAndCompetitionService } from 'src/competitions/domain/services/RoundAndCompetition.service';
import { ApiError, RoundErrors, TaskErrors } from 'src/error/ApiError';

interface CreateTaskCommandInput {
  roundId: string;
  user: UserEntity;
  taskCreationData: {
    name: string;
    description: string;
    color: string;
  };
}

export class CreateTaskCommand extends Command<CreateTaskCommandInput, void> {
  @Inject(ReposTokens.TaskRepository)
  private readonly taskRepository: TaskRepository;

  @Inject(ReposTokens.RoundRepository)
  private readonly roundRepository: RoundRepository;

  async implementation(data: CreateTaskCommandInput): Promise<void> {
    const color = Color.define(data.taskCreationData.color);

    const round = await this.taskRepository.findRelatedRound(data.roundId);
    if (!round) ApiError.throw(RoundErrors.ROUND_NOT_FOUND);

    const task = RoundAndCompetitionService.createTask({
      ...data.taskCreationData,
      color,
    });
    if (!task) ApiError.throw(TaskErrors.TASK_NOT_FOUND);

    await this.taskRepository.save(task);
    round.addTask(task);

    await this.roundRepository.save(round);
  }
}
