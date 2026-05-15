import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Command } from 'src/common/application/Command';
import { ReposTokens } from 'src/common/Tokens';
import type { ITaskRepository } from '../bounds/TaskRepository';
import { ApiError, TaskErrors } from 'src/error/ApiError';
import { TeamAndCompetitionService } from 'src/competitions/domain/services/TeamAndCompetition.service';

interface DeleteTaskCommandInput {
  taskId: string;
  actor: UserEntity;
}

@Injectable()
export class DeleteTaskCommand extends Command<DeleteTaskCommandInput, void> {
  @Inject(ReposTokens.TaskRepository)
  private readonly taskRepo: ITaskRepository;
  async implementation(data: DeleteTaskCommandInput): Promise<void> {
    const comp = await this.taskRepo.findCompetitionByTaskId(data.taskId);
    const task = await this.taskRepo.findById(data.taskId);

    if (!comp || !task) ApiError.throw(TaskErrors.TASK_OR_COMP_NOT_FOUND);

    TeamAndCompetitionService.canChange(data.actor, comp);

    await this.taskRepo.deleteById(data.taskId);
  }
}
