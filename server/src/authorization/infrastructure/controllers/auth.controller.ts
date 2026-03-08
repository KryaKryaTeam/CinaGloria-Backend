import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
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
import { LoginCommand } from 'src/authorization/application/useCases/LoginCommand';
import { CommandTokens } from 'src/common/Tokens';
import type {
  Response as ExpressResponse,
  Request as ExpressRequest,
} from 'express';
import { ConfigService } from '@nestjs/config';
import { CreateUserLocal } from '../dtos/CreateUserLocal';
import { ApiBasicAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { LoginResponse } from '../dtos/LoginResponse';
import { RefreshResponse } from '../dtos/RefreshResponse';
import { RefreshCommand } from 'src/authorization/application/useCases/RefreshCommand';
import { Secure } from '../guards/auth/auth.guard';
import { GetCSRFToken } from 'src/authorization/application/useCases/GetCSRFToken';
import { LoginQueryParams } from '../dtos/LoginQueryParams';
import { RegistrationCommand } from 'src/authorization/application/useCases/RegistrationCommand';

@Controller('auth')
export class AuthController {
  @Inject(CommandTokens.LoginCommand)
  private readonly loginCommand: LoginCommand;

  @Inject(CommandTokens.RegistarationCommand)
  private readonly registrationCommand: RegistrationCommand;

  @Inject(CommandTokens.RefreshCommand)
  private readonly refreshCommand: RefreshCommand;

  @Inject(CommandTokens.GetCSRFToken)
  private readonly getCSRFTokenCommand: GetCSRFToken;

  @Inject()
  private readonly configurationService: ConfigService;

  @Post('/login')
  @Version('1')
  @ApiBody({ type: CreateUserLocal, required: false })
  @ApiResponse({ type: LoginResponse, status: 201 })
  async login(
    @Query() { state, code, provider }: LoginQueryParams,
    @Body() body: CreateUserLocal,
    @Response({ passthrough: true }) res: ExpressResponse,
    @Request() req: ExpressRequest,
  ) {
    if (!provider || !state)
      throw new BadRequestException('Provider or state!');

    const csrfProtected = req.cookies.csrf == state;
    if (!csrfProtected) throw new ForbiddenException('CSRF Protection failed');

    const result = await this.loginCommand.execute({
      loginData: { token: code, ...body },
      type: provider,
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

  @Post('/registration')
  @Version('1')
  @ApiBody({ type: CreateUserLocal, required: false })
  @ApiResponse({ type: LoginResponse, status: 201 })
  async registration(
    @Query() { state, code, provider }: LoginQueryParams,
    @Body() body: CreateUserLocal,
    @Response({ passthrough: true }) res: ExpressResponse,
    @Request() req: ExpressRequest,
  ) {
    if (!provider || !state)
      throw new BadRequestException('Provider or state!');

    const csrfProtected = req.cookies.csrf == state;
    if (!csrfProtected) throw new ForbiddenException('CSRF Protection failed');

    const result = await this.registrationCommand.execute({
      loginData: { token: code, ...body },
      type: provider,
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
    if (!refresh) throw new UnauthorizedException('Invalid refresh token');

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
  @Secure(true)
  @ApiBasicAuth('main')
  async changePassword() {}
}
