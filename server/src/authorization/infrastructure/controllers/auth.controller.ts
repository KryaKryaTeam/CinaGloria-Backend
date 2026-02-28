import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Put,
  Query,
  Req,
  Res,
  Response,
  UnauthorizedException,
  Version,
} from '@nestjs/common';
import { LoginCommand } from 'src/authorization/application/useCases/LoginCommand.command';
import { CommandTokens } from 'src/common/Tokens';
import { DomainError, DomainErrors } from 'src/error/DomainError';
import { AuthorizationProviderTypes } from 'src/types/AuthorizationProvidersTypes';
import type {
  Response as ExpressResponse,
  Request as ExpressRequest,
} from 'express';
import { ConfigService } from '@nestjs/config';
import { CreateUserLocal } from '../dtos/CreateUserLocal';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { LoginResponse } from '../dtos/LoginResponse';
import { RefreshResponse } from '../dtos/RefreshResponse';
import { RefreshCommand } from 'src/authorization/application/useCases/RefreshCommand.command';
import { Secure } from '../guards/auth/auth.guard';
import { GetPublicProfileQuery } from 'src/authorization/application/useCases/GetPublicProfileQuery';
import { GetPublicProfileRes } from '../dtos/GetPublicProfileRes';
import { GetPrivateProfileQuery } from 'src/authorization/application/useCases/GetPrivateProfileQuery';
import { GetPrivateProfileRes } from '../dtos/GetPrivateProfileRes';

@Controller('auth')
export class AuthController {
  @Inject(CommandTokens.LoginCommand)
  private readonly loginCommand: LoginCommand;

  @Inject(CommandTokens.RefreshCommand)
  private readonly refreshCommand: RefreshCommand;

  @Inject(CommandTokens.GetPublicProfileQuery)
  private readonly getPublicProfileQuery: GetPublicProfileQuery;

  @Inject(CommandTokens.GetPrivateProfileQuery)
  private readonly getPrivateProfileQuery: GetPrivateProfileQuery;

  @Inject()
  private readonly configurationService: ConfigService;

  @Post('/login')
  @Version('1')
  @ApiQuery({
    name: 'provider',
    enum: AuthorizationProviderTypes,
    enumName: 'Authorization Providers',
    description: 'Specify which authorization provider to use',
    required: true,
  })
  @ApiQuery({
    name: 'code',
    required: false,
    description: 'Code for OAuth provider',
  })
  @ApiBody({ type: CreateUserLocal, required: false })
  @ApiResponse({ type: LoginResponse, status: 201 })
  async login(
    @Query('provider')
    provider: string,
    @Query('code')
    code: string,
    @Body() body: CreateUserLocal,
    @Response({ passthrough: true }) res: ExpressResponse,
  ) {
    if (!provider)
      throw new DomainError(DomainErrors.UNEXPECTED_VALUE, 'Provider!');

    const result = await this.loginCommand.execute({
      loginData: { token: code, ...body },
      type: provider as AuthorizationProviderTypes,
    });

    res.cookie(
      'refresh',
      result.refreshToken,
      this.configurationService.getOrThrow('cookie'),
    );

    return {
      accessToken: result.accessToken,
      userExistsBefore: result.userExists,
    };
  }

  @Post('/refresh')
  @Version('1')
  @ApiResponse({ type: RefreshResponse, status: 200 })
  async refresh(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const { refresh } = req.cookies as { refresh: string };
    if (!refresh) throw new UnauthorizedException();

    const result = await this.refreshCommand.execute(refresh);

    res.cookie(
      'refresh',
      result.refreshToken,
      this.configurationService.getOrThrow('cookie'),
    );

    return {
      accessToken: result.accessToken,
    };
  }

  @Get('/user/private')
  @Version('1')
  @ApiBearerAuth('main')
  @Secure(true)
  @ApiResponse({ type: GetPrivateProfileRes, status: 200 })
  async getUserPrivateData(@Req() req: ExpressRequest) {
    if (!req['user_id']) throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

    return await this.getPrivateProfileQuery.execute(req['user_id'] as string);
  }

  @Get('/user/public')
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

  @Put('/user')
  @Version('1')
  @ApiBasicAuth('main')
  @Secure(true)
  async updateUserAdditionalData() {}

  @Put('/user/username')
  @Version('1')
  @ApiBasicAuth('main')
  @Secure(true)
  async updateUsername() {}

  @Put('/user/avatar')
  @Version('1')
  @ApiBasicAuth('main')
  @Secure(true)
  async updateAvatar() {}

  @Put('/password')
  @Version('1')
  @ApiBasicAuth('main')
  @Secure(true)
  async changePassword() {}
}
