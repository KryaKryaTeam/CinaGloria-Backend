import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Patch,
  Post,
  Query,
  Version,
} from '@nestjs/common';
import { UpdateSubmitionDto } from '../dtos/UpdateSubmition.dto';
import { CreateSubmissionDto } from '../dtos/CreateSubmission.dto';
import { Secure } from 'src/authorization/infrastructure/guards/auth/auth.guard';
import { AllowRoles } from 'src/authorization/infrastructure/guards/role/role.guard';
import { RoleEnum } from 'src/types/RoleEnum';
import { ApiResponse } from '@nestjs/swagger';
import { SubmitionEntity } from 'src/judging/domain/entities/Submition.entity';
import { CommandTokens } from 'src/common/Tokens';
import { CreateSubmissionCommand } from 'src/judging/application/commands/CreateSubmission.command';
import { UpdateSubmissionCommand } from 'src/judging/application/commands/UpdateSubmission.command';
import { FindSubmissionByIdCommand } from 'src/judging/application/commands/FindSubmissionById.command';
import { DeleteSubmissionCommand } from 'src/judging/application/commands/DeleteSubmission.command';

@Controller('submission')
export class SubmissionController {
  @Inject(CommandTokens.CreateSubmissionCommand)
  private readonly createSubmissionCommand: CreateSubmissionCommand;

  @Inject(CommandTokens.UpdateSubmissionCommand)
  private readonly updateSubmissionCommand: UpdateSubmissionCommand;

  @Inject(CommandTokens.FindSubmissionByIdCommand)
  private readonly findSubmissionByIdCommand: FindSubmissionByIdCommand;

  @Inject(CommandTokens.DeleteSubmissionCommand)
  private readonly deleteSubmissionCommand: DeleteSubmissionCommand;

  @Post('create')
  @Secure()
  @Version('1')
  @AllowRoles([RoleEnum.USER])
  async create(@Body() dto: CreateSubmissionDto) {
    await this.createSubmissionCommand.execute(dto);
  }

  @Get('find')
  @Secure()
  @Version('1')
  @AllowRoles([
    RoleEnum.ADMIN,
    RoleEnum.JUDGE,
    RoleEnum.ORGANIZER,
    RoleEnum.USER,
  ])
  @ApiResponse({ status: 200, type: SubmitionEntity })
  async find(@Query('id') id: string) {
    return await this.findSubmissionByIdCommand.execute(id);
  }

  @Patch('update')
  @Version('1')
  @Secure()
  @AllowRoles([RoleEnum.USER])
  async update(@Body() dto: UpdateSubmitionDto) {
    await this.updateSubmissionCommand.execute(dto);
  }

  @Delete('delete')
  @Version('1')
  @Secure()
  @AllowRoles([RoleEnum.USER, RoleEnum.ADMIN, RoleEnum.ORGANIZER])
  async delete(@Query('id') id: string) {
    await this.deleteSubmissionCommand.execute(id);
  }
}
