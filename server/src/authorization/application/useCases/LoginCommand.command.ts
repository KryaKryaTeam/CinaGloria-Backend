import { Inject, Injectable, Scope } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import { AuthorizationProviderTypes } from 'src/types/AuthorizationProvidersTypes';
import type { IAuthorizationProviderService } from '../bounds/IAuthorizationProviderService';
import type { IUserRepository } from '../bounds/IUserRepository';
import { ReposTokens, ServiceTokens } from 'src/common/Tokens';

interface LoginCommandProps {
  type: AuthorizationProviderTypes;
  loginData: unknown;
}

interface LoginCommandOutput {
  accessToken: string;
  refreshToken: string;
}

@Injectable({ scope: Scope.REQUEST })
export class LoginCommand extends Command<
  LoginCommandProps,
  LoginCommandOutput
> {
  @Inject(ServiceTokens.AuthorizationProviderService)
  authorizationProviderService: IAuthorizationProviderService;

  @Inject(ReposTokens.UserRepository)
  userRepository: IUserRepository;

  async implementation(data: LoginCommandProps): Promise<LoginCommandOutput> {
    const user = await this.authorizationProviderService.authorize(
      data.type,
      data.loginData,
    );

    await this.userRepository.save(user);

    return {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
    };
  }
}
