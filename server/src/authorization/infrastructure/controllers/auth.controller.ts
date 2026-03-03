import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Put,
  Query,
  Req,
  Request,
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
import { ApiBasicAuth, ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { LoginResponse } from '../dtos/LoginResponse';
import { RefreshResponse } from '../dtos/RefreshResponse';
import { RefreshCommand } from 'src/authorization/application/useCases/RefreshCommand.command';
import { Secure } from '../guards/auth/auth.guard';
import { GetCSRFToken } from 'src/authorization/application/useCases/GetCSRFToken';

@Controller('auth')
export class AuthController {
  @Inject(CommandTokens.LoginCommand)
  private readonly loginCommand: LoginCommand;

  @Inject(CommandTokens.RefreshCommand)
  private readonly refreshCommand: RefreshCommand;

  @Inject(CommandTokens.GetCSRFToken)
  private readonly getCSRFTokenCommand: GetCSRFToken;

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
    name: 'state',
    required: true,
    description: 'CSRF protection code',
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
    @Query('state')
    state: string,
    @Body() body: CreateUserLocal,
    @Response({ passthrough: true }) res: ExpressResponse,
    @Request() req: ExpressRequest,
  ) {
    if (!provider || !state)
      throw new DomainError(
        DomainErrors.UNEXPECTED_VALUE,
        'Provider or state!',
      );

    const csrfProtected = req.cookies.csrf == state;
    if (!csrfProtected) throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

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

  @Put('/logout')
  @Version('1')
  @Secure(true)
  logout(@Res({ passthrough: true }) res: ExpressResponse) {
    res.clearCookie('refresh', this.configurationService.getOrThrow('cookie'));
  }

  @Get('/csrf')
  @Version('1')
  async csrf(@Res({ passthrough: true }) res: ExpressResponse) {
    const token = await this.getCSRFTokenCommand.execute(null);

    res.cookie('csrf', token, this.configurationService.getOrThrow('cookie'));

    return { csrf: token };
  }

  @Put('/password')
  @Version('1')
  @ApiBasicAuth('main')
  @Secure(true)
  async changePassword() {}
}
