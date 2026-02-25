import {
  Body,
  Controller,
  Inject,
  Post,
  Query,
  Response,
  Version,
} from '@nestjs/common';
import { CheckCommand } from 'src/authorization/application/useCases/CheckCommand.command';
import { LoginCommand } from 'src/authorization/application/useCases/LoginCommand.command';
import { CommandTokens } from 'src/common/Tokens';
import { DomainError, DomainErrors } from 'src/error/DomainError';
import { AuthorizationProviderTypes } from 'src/types/AuthorizationProvidersTypes';
import type { Response as ExpressResponse } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  @Inject(CommandTokens.LoginCommand)
  private readonly loginCommand: LoginCommand;

  @Inject(CommandTokens.CheckCommand)
  private readonly checkCommand: CheckCommand;

  @Inject()
  private readonly configurationService: ConfigService;

  @Post('/login')
  @Version('1')
  async login(
    @Query('provider') provider: string,
    @Query('code') code: string,
    @Body() body: object,
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

    return { accessToken: result.accessToken };
  }

  @Post('/check')
  @Version('1')
  async check() {
    await this.checkCommand.execute(null);
    return { status: 'OK!' }; // Return objects for consistent JSON responses
  }
}
