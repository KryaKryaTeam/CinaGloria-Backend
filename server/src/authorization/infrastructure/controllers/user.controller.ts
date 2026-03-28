import {
  Body,
  Controller,
  Get,
  Inject,
  Put,
  Query,
  Version,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { GetPublicProfileRes } from '../dtos/GetPublicProfileRes';
import { Secure } from '../guards/auth/auth.guard';
import { GetPrivateProfileRes } from '../dtos/GetPrivateProfileRes';
import { GetPrivateProfileQuery } from 'src/authorization/application/useCases/GetPrivateProfileQuery';
import { GetPublicProfileQuery } from 'src/authorization/application/useCases/GetPublicProfileQuery';
import { CommandTokens } from 'src/common/Tokens';
import { UpdateUserAdditionalDataDto } from '../dtos/UpdateUserAdditionalData';
import { UpdateAdditionalDataCommand } from 'src/authorization/application/useCases/UpdateAdditionalDataCommand';
import { UpdateUsernameCommand } from 'src/authorization/application/useCases/UpdateUsernameCommand';
import { UpdateUsernameReq } from '../dtos/UpdateUsernameReq';
import { UpdateAvatarCommand } from 'src/authorization/application/useCases/UpdateAvatarCommand';
import { UpdateAvatarReq } from '../dtos/UpdateAvatarReq';
import { UserId } from '../decorators/user.decorator';
import { ApiError, UserErrors } from 'src/error/ApiError';

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

  @Get('/me')
  @Version('1')
  @Secure()
  @ApiResponse({ type: GetPrivateProfileRes, status: 200 })
  async getUserPrivateData(@UserId() id: string) {
    return await this.getPrivateProfileQuery.execute(id);
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
    if (!id) ApiError.throw(UserErrors.ID_OF_REQUESTED_USER_NOT_PROVIDED);

    return await this.getPublicProfileQuery.execute(id);
  }

  @Put('/additional')
  @Version('1')
  @Secure()
  @ApiBody({ type: UpdateUserAdditionalDataDto, required: true })
  async updateUserAdditionalData(
    @Body() body: UpdateUserAdditionalDataDto,
    @UserId() id: string,
  ) {
    await this.updateUserAdditionalDataCommand.execute({
      data: body,
      id,
    });
  }

  @Put('/username')
  @Version('1')
  @Secure()
  @ApiBody({ type: UpdateUsernameReq })
  async updateUsername(@Body() body: UpdateUsernameReq, @UserId() id: string) {
    await this.updateUsernameCommand.execute({
      username: body.username,
      id,
    });
  }

  @Put('/avatar')
  @Version('1')
  @Secure()
  @ApiBody({ type: UpdateAvatarReq })
  async updateAvatar(@Body() body: UpdateAvatarReq, @UserId() id: string) {
    await this.updateAvatarCommand.execute({
      avatar: body.avatar,
      id,
    });
  }
}
