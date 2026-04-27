import {
  Body,
  Controller,
  Inject,
  Post,
  ValidationPipe,
  Version,
} from '@nestjs/common';
import { AllowRoles } from 'src/authorization/infrastructure/guards/role/role.guard';
import { RoleEnum } from 'src/types/RoleEnum';
import { CreateTaskDto } from '../dto/CreateTask.dto';
import { CommandTokens } from 'src/common/Tokens';
import { CreateTaskCommand } from 'src/competitions/application/commands/CreateTask.command';
import { UserId } from 'src/authorization/infrastructure/decorators/user.decorator';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';

@Controller('task')
export class TaskController {
  @Inject(CommandTokens.CreateTaskCommand)
  private readonly createTaskCommand: CreateTaskCommand;

  @Post('create')
  @Version('1')
  @AllowRoles([RoleEnum.ADMIN, RoleEnum.ORGANIZER])
  async createTask(
    @Body(new ValidationPipe()) dto: CreateTaskDto,
    @UserId() user: UserEntity,
  ) {
    return await this.createTaskCommand.execute({
      roundId: dto.roundId,
      user,
      taskCreationData: {
        name: dto.name,
        description: dto.descrpition,
        color: dto.color,
      },
    });
  }
}
