import {
  Body,
  Controller,
  Delete,
  Inject,
  Param,
  Post,
  Version,
} from '@nestjs/common';
import { AllowRoles } from 'src/authorization/infrastructure/guards/role/role.guard';
import { RoleEnum } from 'src/types/RoleEnum';
import { CreateTaskDto } from '../dto/CreateTask.dto';
import { CommandTokens } from 'src/common/Tokens';
import { CreateTaskCommand } from 'src/competitions/application/commands/CreateTask.command';
import { UserId } from 'src/authorization/infrastructure/decorators/user.decorator';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { TaskIdDto } from '../dto/TaskId.dto';
import { DeleteTaskCommand } from 'src/competitions/application/commands/DeleteTask.command';
import { Secure } from 'src/authorization/infrastructure/guards/auth/auth.guard';

@Controller('task')
export class TaskController {
  @Inject(CommandTokens.CreateTaskCommand)
  private readonly createTaskCommand: CreateTaskCommand;
  @Inject(CommandTokens.DeleteTaskCommand)
  private readonly deleteTaskCommand: DeleteTaskCommand;
  @Post('')
  @Version('1')
  @Secure()
  @AllowRoles([RoleEnum.ADMIN, RoleEnum.ORGANIZER])
  async createTask(@Body() dto: CreateTaskDto, @UserId() user: UserEntity) {
    return await this.createTaskCommand.execute({
      roundId: dto.roundId,
      user,
      taskCreationData: {
        name: dto.name,
        description: dto.description,
        color: dto.color,
      },
    });
  }

  @Delete('/:teamId')
  @Version('1')
  @Secure()
  @AllowRoles([RoleEnum.ADMIN, RoleEnum.ORGANIZER])
  async deleteTask(@UserId() user: UserEntity, @Param() taskId: TaskIdDto) {
    return await this.deleteTaskCommand.execute({
      actor: user,
      taskId: taskId.taskId,
    });
  }
}
