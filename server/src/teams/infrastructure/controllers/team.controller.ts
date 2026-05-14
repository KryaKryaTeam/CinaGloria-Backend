import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Version,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { Secure } from 'src/authorization/infrastructure/guards/auth/auth.guard';
import { TeamEntityDto } from '../dtos/TeamEntity.dto';
import { PageQueryDto } from 'src/common/infrastructure/dto/PageQuery.dto';
import { CommandTokens } from 'src/common/Tokens';
import { GetMyTeamsPage } from 'src/teams/application/commands/GetMyTeamsPage.query';
import { UserId } from 'src/authorization/infrastructure/decorators/user.decorator';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { CreateTeamDto } from '../dtos/CreateTeam.dto';
import { CreateTeamCommand } from 'src/teams/application/commands/CreateTeam.command';
import { UpdateTeamDto } from '../dtos/UpdateTeam.dto';
import { PatchTeamCommand } from 'src/teams/application/commands/PatchTeam.command';
import { TeamIdDto } from '../dtos/TeamId.dto';
import { DeleteTeamCommand } from 'src/teams/application/commands/DeleteTeam.command';
import { AddMemberDto } from '../dtos/AddMember.dto';
import { InviteMemberCommand } from 'src/teams/application/commands/InviteMember.command';
import { TeamMemberIdDto } from '../dtos/TeamMemberId.dto';
import { DeleteMemberCommand } from 'src/teams/application/commands/DeleteMember.command';
import { ChangeCaptainDto } from '../dtos/ChangeCaptain.dto';
import { ChangeCaptainCommand } from 'src/teams/application/commands/ChangeCaptain.command';
import { RegistrationDto } from '../dtos/Registration.dto';
import { RegisterTeamCommand } from 'src/teams/application/commands/RegisterTeam.command';
import { CancelRegistrationOfTeamsCommand } from 'src/teams/application/commands/CancelRegistrationOfTeams.command';
import { AcceptMemberInviteCommand } from 'src/teams/application/commands/AcceptMemberInvite.command';
import { TeamSearchParamsDto } from '../dtos/TeamSearchParams.dto';

@Controller('teams')
export class TeamController {
  @Inject(CommandTokens.GetMyTeamsPageQuery)
  private readonly getMyTeamsPageQuery: GetMyTeamsPage;

  @Inject(CommandTokens.CreateTeamCommand)
  private readonly createTeamCommand: CreateTeamCommand;

  @Inject(CommandTokens.PatchTeamCommand)
  private readonly patchteamcommand: PatchTeamCommand;

  @Inject(CommandTokens.DeleteTeamCommand)
  private readonly deleteTeamCommand: DeleteTeamCommand;

  @Inject(CommandTokens.InviteMemberCommand)
  private readonly invitemembercommand: InviteMemberCommand;

  @Inject(CommandTokens.DeleteMemberCommand)
  private readonly deletemembercommand: DeleteMemberCommand;

  @Inject(CommandTokens.ChangeCaptainCommand)
  private readonly changeCaptainCommand: ChangeCaptainCommand;

  @Inject(CommandTokens.RegisterTeamCommand)
  private readonly teamRegistrationCommand: RegisterTeamCommand;

  @Inject(CommandTokens.CancelRegistrationOfTeamsCommand)
  private readonly cancelRegistrationOfTeamsCommand: CancelRegistrationOfTeamsCommand;

  @Inject(CommandTokens.AcceptMemberInviteCommand)
  private readonly AcceptMemberInviteCommand: AcceptMemberInviteCommand;

  @Get('me/:page')
  @Secure()
  @Version('1')
  @ApiResponse({ status: 200, type: [TeamEntityDto] })
  async getMyTeams(
    @Param() dto: PageQueryDto,
    @UserId() user: UserEntity,
    @Query() searchParams: TeamSearchParamsDto,
  ) {
    return await this.getMyTeamsPageQuery.execute({
      actor: user,
      page: dto.page,
      searchParams,
    });
  }

  @Post()
  @Secure()
  @Version('1')
  @ApiResponse({ status: 201, type: TeamEntityDto })
  async createTeam(@Body() dto: CreateTeamDto, @UserId() user: UserEntity) {
    return (await this.createTeamCommand.execute({ teamData: dto, user })).team;
  }

  @Patch(':teamId')
  @Secure()
  @Version('1')
  @ApiResponse({ status: 200 })
  async updateTeam(
    @Body() dto: UpdateTeamDto,
    @UserId() user: UserEntity,
    @Param() teamId: TeamIdDto,
  ) {
    return await this.patchteamcommand.execute({
      teamData: dto,
      teamId: teamId.teamId,
      user,
    });
  }

  @Delete(':teamId')
  @Secure()
  @Version('1')
  @ApiResponse({ status: 200 })
  async deleteTeam(@UserId() user: UserEntity, @Param() teamId: TeamIdDto) {
    return await this.deleteTeamCommand.execute({
      actor: user,
      teamId: teamId.teamId,
    });
  }

  @Post(':teamId/members')
  @Secure()
  @Version('1')
  @ApiResponse({ status: 200 })
  async addMember(
    @UserId() user: UserEntity,
    @Body() dto: AddMemberDto,
    @Param() teamId: TeamIdDto,
  ) {
    return await this.invitemembercommand.execute({
      actor: user,
      target: dto.memberId,
      teamId: teamId.teamId,
    });
  }

  @Delete(':teamId/members/:memberId')
  @Secure()
  @Version('1')
  @ApiResponse({ status: 200 })
  async removeMember(
    @UserId() user: UserEntity,
    @Param() dto: TeamMemberIdDto,
  ) {
    return await this.deletemembercommand.execute({
      actor: user,
      targetId: dto.memberId,
      teamId: dto.teamId,
    });
  }

  @Patch(':teamId/captain')
  @Secure()
  @Version('1')
  @ApiResponse({ status: 200 })
  async changeCaptain(
    @UserId() user: UserEntity,
    @Param() teamId: TeamIdDto,
    @Body() dto: ChangeCaptainDto,
  ) {
    return await this.changeCaptainCommand.execute({
      actor: user,
      target: dto.captain,
      teamId: teamId.teamId,
    });
  }

  @Post(':teamId/registration')
  @Secure()
  @Version('1')
  @ApiResponse({ status: 200 })
  async startRegistration(
    @UserId() user: UserEntity,
    @Param() teamId: TeamIdDto,
    @Body() dto: RegistrationDto,
  ) {
    return await this.teamRegistrationCommand.execute({
      actor: user,
      competitionId: dto.competitionId,
      teamId: teamId.teamId,
    });
  }

  @Delete(':teamId/registration')
  @Secure()
  @Version('1')
  @ApiResponse({ status: 200 })
  async cancelRegistration(
    @UserId() user: UserEntity,
    @Param() teamId: TeamIdDto,
  ) {
    return await this.cancelRegistrationOfTeamsCommand.execute({
      actor: user,
      teamId: teamId.teamId,
    });
  }

  @Post(':teamId/accept')
  @Secure()
  @Version('1')
  @ApiResponse({ status: 200 })
  async acceptInvite(@UserId() user: UserEntity, @Param() teamId: TeamIdDto) {
    return await this.AcceptMemberInviteCommand.execute({
      actor: user,
      teamId: teamId.teamId,
    });
  }
}
