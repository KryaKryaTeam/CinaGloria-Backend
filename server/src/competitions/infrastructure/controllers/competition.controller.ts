import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Post,
  Put,
  Query,
  Version,
} from '@nestjs/common';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { UserId } from 'src/authorization/infrastructure/decorators/user.decorator';
import { Secure } from 'src/authorization/infrastructure/guards/auth/auth.guard';
import { AllowRoles } from 'src/authorization/infrastructure/guards/role/role.guard';
import { CommandTokens } from 'src/common/Tokens';
import { CreateCompetitionCommand } from 'src/competitions/application/commands/CreateCompetition.command';
import { DeclineScheduledPublishCommand } from 'src/competitions/application/commands/DeclineScheduleOfPublishingOfCompetition.command';
import { DeleteCompetitionCommand } from 'src/competitions/application/commands/DeleteCompetition';
import { GetCompetitionPageQuery } from 'src/competitions/application/commands/GetPageOfCompetition.command';
import { GetPublicCompetitionsPageQuery } from 'src/competitions/application/commands/GetPageOfPublicCompetitions.command';
import { GetPublicCompetitionQuery } from 'src/competitions/application/commands/GetPublicCompetition.command';
import { PublishCompetitionCommand } from 'src/competitions/application/commands/PublishCompetition.command';
import { ScheduleCompetitionPublishCommand } from 'src/competitions/application/commands/SchedulePublishingOfCompetition.command';
import { UpdateCompetitionCommand } from 'src/competitions/application/commands/UpdateCompetition.command';
import { RoleEnum } from 'src/types/RoleEnum';
import { CreateCompetitionDto } from '../dto/CreateCompetition.dto';
import { SchedulePublishCompetitionDto } from '../dto/SchedulePublishCompetition.dto';
import { PageQueryDto } from 'src/common/infrastructure/dto/PageQuery.dto';
import { ApiResponse } from '@nestjs/swagger';
import { PlainCompetitionDto } from '../dto/PlainCompetition.dto';
import { PublicInListCompetitionDto } from '../dto/PublicInListCompetition.dto';

@Controller('/competition')
export class CompetitionController {
  @Inject(CommandTokens.CreateCompetitionCommand)
  private readonly createCompetitionCommand: CreateCompetitionCommand;

  @Inject(CommandTokens.DeclineScheduledPublishCommand)
  private readonly declineScheduledPublishCommand: DeclineScheduledPublishCommand;

  @Inject(CommandTokens.DeleteCompetitionCommand)
  private readonly deletecompetitionCommand: DeleteCompetitionCommand;

  @Inject(CommandTokens.GetCompetitionPageQuery)
  private readonly getCompetitionPageQuery: GetCompetitionPageQuery;

  @Inject(CommandTokens.GetPublicCompetitionsPageQuery)
  private readonly getPublicCompetitionsPageQuery: GetPublicCompetitionsPageQuery;

  @Inject(CommandTokens.GetPublicCompetitionQuery)
  private readonly getPublicCompetitionQuery: GetPublicCompetitionQuery;

  @Inject(CommandTokens.PublishCompetitionCommand)
  private readonly publishCompetitionCommand: PublishCompetitionCommand;

  @Inject(CommandTokens.ScheduleCompetitionPublishCommand)
  private readonly scheduleCompetitionPublishCommand: ScheduleCompetitionPublishCommand;

  @Inject(CommandTokens.UpdateCompetitionCommand)
  private readonly updateCompetitionCommand: UpdateCompetitionCommand;

  @Get('/private/:page')
  @Version('1')
  @Secure()
  @AllowRoles([RoleEnum.ADMIN, RoleEnum.ORGANIZER])
  @ApiResponse({ status: 200, type: [PlainCompetitionDto] })
  async getPrivateCompetition(
    @Query() pageDto: PageQueryDto,
    @UserId() user: UserEntity,
  ) {
    return (
      await this.getCompetitionPageQuery.execute({ page: pageDto.page, user })
    ).competitions;
  }

  @Get('/public/page/:page')
  @Version('1')
  @ApiResponse({ status: 200, type: [PublicInListCompetitionDto] })
  async getPageOfPublicCompetitions(@Query() pageDto: PageQueryDto) {
    return (
      await this.getPublicCompetitionsPageQuery.execute({ page: pageDto.page })
    ).competitions;
  }

  @Get('/public/single/:competitionId')
  @Version('1')
  async getPublicCompetition(@Query('competitionId') competitionId: string) {
    return (await this.getPublicCompetitionQuery.execute({ competitionId }))
      .competition;
  }

  @Post('/create')
  @Version('1')
  @Secure()
  @AllowRoles([RoleEnum.ADMIN, RoleEnum.ORGANIZER])
  @ApiResponse({ status: 201, type: PlainCompetitionDto })
  async createCompetition(
    @Body() dto: CreateCompetitionDto,
    @UserId() user: UserEntity,
  ) {
    return await this.createCompetitionCommand.execute({
      competition: dto,
      user,
    });
  }

  @Delete('/delete/:competitionId')
  @Version('1')
  @Secure()
  @AllowRoles([RoleEnum.ADMIN, RoleEnum.ORGANIZER])
  async deleteCompetition(
    @UserId() user: UserEntity,
    @Query('competitionId') competitionId: string,
  ) {
    return await this.deletecompetitionCommand.execute({ competitionId, user });
  }

  @Put('/publish/:competitionId')
  @Version('1')
  @Secure()
  @AllowRoles([RoleEnum.ADMIN, RoleEnum.ORGANIZER])
  async publishCompetition(
    @UserId() user: UserEntity,
    @Query('competitionId') competitionId: string,
  ) {
    return await this.publishCompetitionCommand.execute({
      user,
      competitionId,
    });
  }

  @Put('/schedule/set/:competitionId')
  @Version('1')
  @Secure()
  @AllowRoles([RoleEnum.ADMIN, RoleEnum.ORGANIZER])
  async schedulePublishingOfCompetition(
    @UserId() user: UserEntity,
    @Query('competitionId') competitionId: string,
    @Body() dto: SchedulePublishCompetitionDto,
  ) {
    return await this.scheduleCompetitionPublishCommand.execute({
      user,
      competitionId,
      publishAt: dto.publishAt,
    });
  }

  @Put('/update/:competitionId')
  @Version('1')
  @Secure()
  @AllowRoles([RoleEnum.ADMIN, RoleEnum.ORGANIZER])
  async updateCompetition(
    @Body() dto: CreateCompetitionDto,
    @UserId() user: UserEntity,
    @Query('competitionId') competitionId: string,
  ) {
    return await this.updateCompetitionCommand.execute({
      competitionData: dto,
      user,
      competitionId,
    });
  }

  @Put('/schedule/decline/:competitionId')
  @Version('1')
  @Secure()
  @AllowRoles([RoleEnum.ADMIN, RoleEnum.ORGANIZER])
  async declineScheduledPublishOfCompetition(
    @UserId() user: UserEntity,
    @Query('competitionId') competitionId: string,
  ) {
    return await this.declineScheduledPublishCommand.execute({
      user,
      competitionId,
    });
  }
}
