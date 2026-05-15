import { Controller, Get, Inject, Param, Version } from '@nestjs/common';
import { Secure } from 'src/authorization/infrastructure/guards/auth/auth.guard';
import { AllowRoles } from 'src/authorization/infrastructure/guards/role/role.guard';
import { CommandTokens } from 'src/common/Tokens';
import { GetLeaderboardCommand } from 'src/leaderboard/appliaction/commands/GetLeaderboard.command';
import { RoleEnum } from 'src/types/RoleEnum';
import { GetLeaderboardDto } from '../dtos/GetLeaderboard.dto';

@Controller('leaderboard')
export class LederboardController {
  @Inject(CommandTokens.GetLeaderboardCommand)
  private readonly getLeaderboadCommand: GetLeaderboardCommand;

  @Get('/:roundId')
  @Version('1')
  @Secure()
  @AllowRoles([
    RoleEnum.ADMIN,
    RoleEnum.ORGANIZER,
    RoleEnum.JUDGE,
    RoleEnum.USER,
  ])
  async getLeaderboard(@Param() dto: GetLeaderboardDto) {
    return await this.getLeaderboadCommand.execute(dto.roundId);
  }
}
