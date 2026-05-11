import { Body, Controller, Inject, Post, Version } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { Secure } from 'src/authorization/infrastructure/guards/auth/auth.guard';
import { AllowRoles } from 'src/authorization/infrastructure/guards/role/role.guard';
import { RoleEnum } from 'src/types/RoleEnum';
import { CreateScoreDto } from '../dtos/CreateScore.dto';
import { CommandTokens } from 'src/common/Tokens';
import { CreateScoreCommand } from 'src/judging/application/commands/CreateScore.command';

@Controller('score')
export class ScoreController {
  @Inject(CommandTokens.CreateScoreCommand)
  private readonly createScoreCommand: CreateScoreCommand;

  @Post('create')
  @AllowRoles([RoleEnum.JUDGE])
  @Secure()
  @Version('1')
  @ApiResponse({ status: 201 })
  async create(@Body() dto: CreateScoreDto) {
    await this.createScoreCommand.execute(dto);
  }
}
