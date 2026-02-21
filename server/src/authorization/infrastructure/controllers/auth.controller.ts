import { Body, Controller, Inject, Post, Query, Version } from '@nestjs/common';
import { CheckCommand } from 'src/authorization/application/useCases/CheckCommand.command';
import { LoginCommand } from 'src/authorization/application/useCases/LoginCommand.command';
import { CommandTokens } from 'src/common/Tokens';
import { DomainError, DomainErrors } from 'src/error/DomainError';
import { AuthorizationProviderTypes } from 'src/types/AuthorizationProvidersTypes';

@Controller('auth')
export class AuthController {
  @Inject(CommandTokens.LoginCommand)
  private readonly loginCommand: LoginCommand;

  @Inject(CommandTokens.CheckCommand)
  private readonly checkCommand: CheckCommand;

  @Post('/login')
  @Version('1')
  async login(
    @Query('provider') provider: string,
    @Query('code') code: string,
    @Body() body: object,
  ) {
    if (!provider)
      throw new DomainError(DomainErrors.UNEXPECTED_VALUE, 'Provider!');
    const result = await this.loginCommand.execute({
      loginData: { token: code, ...body },
      type: provider as AuthorizationProviderTypes,
    });

    return result.accessToken;
  }

  @Post('/check')
  @Version('1')
  async check() {
    await this.checkCommand.execute(null);
    return 'OK!';
  }
}
