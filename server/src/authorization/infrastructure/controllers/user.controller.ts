import {
  Body,
  Controller,
  Get,
  Inject,
  Put,
  Query,
  Req,
  Version,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { GetPublicProfileRes } from '../dtos/GetPublicProfileRes';
import { DomainError, DomainErrors } from 'src/error/DomainError';
import { Secure } from '../guards/auth/auth.guard';
import { GetPrivateProfileRes } from '../dtos/GetPrivateProfileRes';
import { ConfigService } from '@nestjs/config';
import { GetPrivateProfileQuery } from 'src/authorization/application/useCases/GetPrivateProfileQuery';
import { GetPublicProfileQuery } from 'src/authorization/application/useCases/GetPublicProfileQuery';
import { CommandTokens } from 'src/common/Tokens';
import type { Request as ExpressRequest } from 'express';
import { UpdateUserAdditionalDataDto } from '../dtos/UpdateUserAdditionalData';
import { UpdateAdditionalDataCommand } from 'src/authorization/application/useCases/UpdateAdditionalDataCommand';
import { UpdateUsernameCommand } from 'src/authorization/application/useCases/UpdateUsernameCommand';
import { UpdateUsernameReq } from '../dtos/UpdateUsernameReq';
import { UpdateAvatarCommand } from 'src/authorization/application/useCases/UpdateAvatarCommand';
import { UpdateAvatarReq } from '../dtos/UpdateAvatarReq';

@Controller('user')
export class UserController {
  @Inject(CommandTokens.GetPublicProfileQuery)
  private readonly getPublicProfileQuery: GetPublicProfileQuery;

  @Inject(CommandTokens.GetPrivateProfileQuery)
  private readonly getPrivateProfileQuery: GetPrivateProfileQuery;

  @Inject(CommandTokens.UpdateUserAdditionalDataCommand)
  private readonly updateUserAdditionalDataCommand: UpdateAdditionalDataCommand;

  @Inject(CommandTokens.UpdateUsernameCommand)
  private readonly updateUsernameCommand: UpdateUsernameCommand;

  @Inject(CommandTokens.UpdateAvatarCommand)
  private readonly updateAvatarCommand: UpdateAvatarCommand;

  @Inject()
  private readonly configurationService: ConfigService;

  @Get('/me')
  @Version('1')
  @ApiBearerAuth('main')
  @Secure(true)
  @ApiResponse({ type: GetPrivateProfileRes, status: 200 })
  async getUserPrivateData(@Req() req: ExpressRequest) {
    if (!req['user_id']) throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

    return await this.getPrivateProfileQuery.execute(req['user_id'] as string);
  }

  @Get('/public')
  @Version('1')
  @ApiQuery({
    type: 'string',
    required: true,
    format: 'uuid',
    name: 'id',
    description: 'Id of requested user',
  })
  @ApiResponse({ type: GetPublicProfileRes, status: 200 })
  async getUserPublicData(@Query('id') id: string) {
    if (!id) throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

    return await this.getPublicProfileQuery.execute(id);
  }

  @Put('/additional')
  @Version('1')
  @ApiBody({ type: UpdateUserAdditionalDataDto, required: true })
  @ApiBearerAuth('main')
  @Secure(true)
  async updateUserAdditionalData(
    @Body() body: UpdateUserAdditionalDataDto,
    @Req() req: ExpressRequest,
  ) {
    await this.updateUserAdditionalDataCommand.execute({
      data: body,
      id: req['user_id'] as string,
    });
  }

  @Put('/username')
  @Version('1')
  @ApiBearerAuth('main')
  @Secure(true)
  @ApiBody({ type: UpdateUsernameReq })
  async updateUsername(
    @Req() req: ExpressRequest,
    @Body() body: UpdateUsernameReq,
  ) {
    await this.updateUsernameCommand.execute({
      id: req['user_id'] as string,
      username: body.username,
    });
  }

  @Put('/avatar')
  @Version('1')
  @ApiBearerAuth('main')
  @Secure(true)
  @ApiBody({ type: UpdateAvatarReq })
  async updateAvatar(
    @Req() req: ExpressRequest,
    @Body() body: UpdateAvatarReq,
  ) {
    await this.updateAvatarCommand.execute({
      id: req['user_id'] as string,
      avatar: body.avatar,
    });
  }
}
