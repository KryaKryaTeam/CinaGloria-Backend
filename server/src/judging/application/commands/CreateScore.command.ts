import { Inject, Injectable } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import { ScoreRepository } from 'src/common/infrastructure/repositories/ScoreRepository';
import { TaskRepository } from 'src/common/infrastructure/repositories/TaskRepository';
import { ReposTokens } from 'src/common/Tokens';
import { ApiError, TaskErrors } from 'src/error/ApiError';
import { ScoreEntity } from 'src/judging/domain/entities/Score.entity';
import { CreateScoreDto } from 'src/judging/infrastructure/dtos/CreateScore.dto';

@Injectable()
export class CreateScoreCommand extends Command<CreateScoreDto, void> {
  @Inject(ReposTokens.ScoreRepository)
  private readonly scoreRepository: ScoreRepository;

  @Inject(ReposTokens.TaskRepository)
  private readonly taskRepository: TaskRepository;

  async implementation(data: CreateScoreDto): Promise<void> {
    const task = await this.taskRepository.findById(data.task);
    if (!task) ApiError.throw(TaskErrors.TASK_NOT_FOUND);

    const competition = task.

    await this.scoreRepository.save(
      ScoreEntity.create({
        score: data.score,
        task,
        team: data.team,
      }),
    );
  }
}
