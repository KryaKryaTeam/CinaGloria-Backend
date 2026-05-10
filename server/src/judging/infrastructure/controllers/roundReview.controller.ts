import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { Secure } from 'src/authorization/infrastructure/guards/auth/auth.guard';
import { AllowRoles } from 'src/authorization/infrastructure/guards/role/role.guard';
import { CommandTokens } from 'src/common/Tokens';
import { CreateRoundReviewCommand } from 'src/judging/application/commands/CreateRoundReview.command';
import { RoleEnum } from 'src/types/RoleEnum';
import { CreateRoundReviewDto } from '../dtos/CreateRoundReview.dto';

@Controller('round_review')
export class RoundReviewController {
  @Inject(CommandTokens.CreateRoundReviewCommand)
  private readonly createRoundReviewCommand: CreateRoundReviewCommand;

  @Post('create')
  @Secure()
  @AllowRoles([RoleEnum.JUDGE])
  @ApiResponse({ status: 201 })
  async create(@Body() dto: CreateRoundReviewDto) {
    await this.createRoundReviewCommand.execute(dto);
  }
}
