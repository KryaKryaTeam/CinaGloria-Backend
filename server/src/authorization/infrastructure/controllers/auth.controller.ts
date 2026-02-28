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
import { CreateUserLocal } from '../dtos/CreateUserLocal';
import { ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { LoginResponse } from '../dtos/LoginResponse';
import { RoleEnum } from 'src/types/RoleEnum';
import { RoleGuard } from '../guards/role/role.guard';

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
}
