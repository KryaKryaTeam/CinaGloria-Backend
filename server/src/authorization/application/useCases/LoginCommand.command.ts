import { Inject, Injectable } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import { AuthorizationProviderTypes } from 'src/types/AuthorizationProvidersTypes';
import type { IAuthorizationProviderService } from '../bounds/IAuthorizationProviderService';
import type { IUserRepository } from '../bounds/IUserRepository';
import { ReposTokens, ServiceTokens } from 'src/common/Tokens';
import type { IJWTTokenService } from '../bounds/IJWTTokenService';

interface LoginCommandProps {
  type: AuthorizationProviderTypes;
  loginData: unknown;
}

interface LoginCommandOutput {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class LoginCommand extends Command<
  LoginCommandProps,
  LoginCommandOutput
> {
  @Inject(ServiceTokens.AuthorizationProviderService)
  private readonly authorizationProviderService: IAuthorizationProviderService;

  @Inject(ReposTokens.UserRepository)
  private readonly userRepository: IUserRepository;

  @Inject(ServiceTokens.JWTService)
  private readonly jwtService: IJWTTokenService;

  async implementation(data: LoginCommandProps): Promise<LoginCommandOutput> {
    const user = await this.authorizationProviderService.authorize(
      data.type,
      data.loginData,
    );

    await this.userRepository.save(user);

    const tokens = this.jwtService.sign({
      email: user.email,
      provider: data.type,
      role: user.role,
      sub: user.id,
      avatar: user.avatarURL.value,
      username: user.username.value,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
