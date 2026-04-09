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
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { LoginResponse } from '../dtos/LoginResponse';
import { RefreshResponse } from '../dtos/RefreshResponse';
import { RefreshCommand } from 'src/authorization/application/useCases/RefreshCommand';
import { Secure } from '../guards/auth/auth.guard';
import { GetCSRFToken } from 'src/authorization/application/useCases/GetCSRFToken';
import { LoginQueryParams } from '../dtos/LoginQueryParams';
import { RegistrationCommand } from 'src/authorization/application/useCases/RegistrationCommand';
import { ValidateRegistrationCommand } from 'src/authorization/application/useCases/ValidateRegistrationCommand';
import { ContinueBody } from '../dtos/ContinueBody';
import { ContinueQuery } from '../dtos/ContinueQuery';
import { ContinueResponse } from '../dtos/ContinueResponse';
import { RegistartionBody } from '../dtos/RegistrationBody';
import { RegistrationResponse } from '../dtos/RegistarationResponse';
import { RegistrationQuery } from '../dtos/RegistrationQuery';
import { ApiError, UserErrors } from 'src/error/ApiError';

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

  @Inject(CommandTokens.ValidateRegistrationCommand)
  private readonly validationCommand: ValidateRegistrationCommand;

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
      ApiError.throw(UserErrors.PROVIDER_OR_STATE_IS_UNDEFINED);

    const csrfProtected = req.cookies.csrf == state;
    if (!csrfProtected) ApiError.throw(UserErrors.CSRF_PROTECTION_FAILED);

    if (!body.code && !code && !body.password)
      ApiError.throw(UserErrors.CREDENTIALS_ARE_UNDEFINED);

    const _code = (body.code || code) as string;

    const result = await this.loginCommand.execute({
      loginData: { token: _code, ...body },
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
  @ApiBody({ type: RegistartionBody, required: false })
  @ApiResponse({ type: RegistrationResponse, status: 200 })
  async registration(
    @Query() { state, provider }: RegistrationQuery,
    @Body() body: RegistartionBody,
    @Request() req: ExpressRequest,
  ) {
    if (!provider || !state)
      ApiError.throw(UserErrors.PROVIDER_OR_STATE_IS_UNDEFINED);

    const csrfProtected = req.cookies.csrf == state;
    if (!csrfProtected) ApiError.throw(UserErrors.CSRF_PROTECTION_FAILED);

    const result = await this.registrationCommand.execute({
      loginData: { ...body },
      type: provider,
    });

    return {
      requestId: result.requestId,
    };
  }

  @Post('/continue')
  @Version('1')
  @ApiBody({ type: ContinueBody })
  @ApiResponse({ type: ContinueResponse, status: 200 })
  async continue(
    @Query() { state }: ContinueQuery,
    @Body() { code, requestId }: ContinueBody,
    @Request() req: ExpressRequest,
    @Response({ passthrough: true }) res: ExpressResponse,
  ) {
    const csrfProtected = req.cookies.csrf == state;
    if (!csrfProtected) ApiError.throw(UserErrors.CSRF_PROTECTION_FAILED);

    const tokens = await this.validationCommand.execute({ code, requestId });

    res.cookie(
      'refresh',
      tokens.refreshToken,
      this.configurationService.getOrThrow('cookie'),
    );

    return { accessToken: tokens.accessToken };
  }

  @Post('/refresh')
  @Version('1')
  @ApiResponse({ type: RefreshResponse, status: 200 })
  async refresh(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const { refresh } = req.cookies as { refresh: string };
    if (!refresh) ApiError.throw(UserErrors.REFRESH_TOKEN_IS_INVALID);

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
  @Secure()
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

  // @Put('/password')
  // @Version('1')
  // @Secure()
  // @ApiBasicAuth('main')
  // async changePassword() {}
}
