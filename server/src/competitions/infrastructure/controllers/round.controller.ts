import {
  Body,
  Controller,
  Delete,
  Inject,
  Patch,
  Post,
  Version,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { Secure } from 'src/authorization/infrastructure/guards/auth/auth.guard';
import { AllowRoles } from 'src/authorization/infrastructure/guards/role/role.guard';
import { RoleEnum } from 'src/types/RoleEnum';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { UserId } from 'src/authorization/infrastructure/decorators/user.decorator';
import { CommandTokens } from 'src/common/Tokens';
import { CreateRoundCommand } from 'src/competitions/application/commands/CreateRound.command';
import { DeleteRoundCommand } from 'src/competitions/application/commands/DeleteRound.command';
import { CreateRoundDto } from '../dto/CreateRound.dto';
import { DeleteRoundDto } from '../dto/DeleteRound.dto';
import { PatchRoundDto } from '../dto/PatchRound.dto';
import { PatchRoundCommand } from 'src/competitions/application/commands/PatchRound.command';

@Controller('round')
export class RoundController {
  @Inject(CommandTokens.CreateRoundCommand)
  private readonly createRoundCommand: CreateRoundCommand;

  @Inject(CommandTokens.DeleteRoundCommand)
  private readonly deleteRoundCommand: DeleteRoundCommand;

  @Inject(CommandTokens.PatchRoundCommand)
  private readonly patchRoundCommand: PatchRoundCommand;

  @Post('create')
  @Version('1')
  @Secure()
  @AllowRoles([RoleEnum.ADMIN, RoleEnum.ORGANIZER])
  @ApiResponse({ status: 201, type: CreateRoundDto })
  async createRound(@Body() dto: CreateRoundDto, @UserId() user: UserEntity) {
    return await this.createRoundCommand.execute({
      competitionId: dto.competitionId,
      roundData: dto.round,
      user,
    });
  }

  @Delete()
  @Version('1')
  @Secure()
  @AllowRoles([RoleEnum.ADMIN, RoleEnum.ORGANIZER])
  @ApiResponse({ status: 200, type: DeleteRoundDto })
  async deleteRound(@Body() dto: DeleteRoundDto) {
    return await this.deleteRoundCommand.execute(dto);
  }

  @Patch()
  @Version('1')
  @Secure()
  @AllowRoles([RoleEnum.ADMIN, RoleEnum.ORGANIZER])
  @ApiResponse({ status: 200, type: PatchRoundDto })
  async patchRound(@Body() dto: PatchRoundDto, @UserId() user: UserEntity) {
    return await this.patchRoundCommand.execute({ ...dto, user });
  }
}
