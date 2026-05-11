import { Inject, Injectable } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import { AuthorizationProviderTypes } from 'src/types/AuthorizationProvidersTypes';
import type { IAuthorizationProviderService } from '../bounds/IAuthorizationProviderService';
import type { IUserRepository } from '../bounds/IUserRepository';
import { ReposTokens, ServiceTokens } from 'src/common/Tokens';
import type { IJWTTokenService } from '../bounds/IJWTTokenService';
import { ApiError, UserErrors } from 'src/error/ApiError';

interface LoginCommandProps {
  type: AuthorizationProviderTypes;
  loginData: unknown;
}

interface LoginCommandOutput {
  accessToken: string;
  refreshToken: string;
  userExists: boolean;
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
    if (data.type == AuthorizationProviderTypes.LOCAL) {
      if (
        !(await this.userRepository.existsByEmail(
          (data.loginData as { email: string }).email,
        ))
      )
        ApiError.throw(UserErrors.USER_BY_THIS_EMAIL_IS_UNDEFINED);
    }

    const { user, existsUser } =
      await this.authorizationProviderService.authorize(
        data.type,
        data.loginData,
      );

    await this.userRepository.save(user);

    const tokens = this.jwtService.sign({
      role: user.role,
      sub: user.id,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      userExists: existsUser,
    };
  }
}
