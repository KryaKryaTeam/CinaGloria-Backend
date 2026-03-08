import { BadRequestException, Inject } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import { ReposTokens, ServiceTokens } from 'src/common/Tokens';
import { AuthorizationProviderTypes } from 'src/types/AuthorizationProvidersTypes';
import type { IJWTTokenService } from '../bounds/IJWTTokenService';
import type { IUserRepository } from '../bounds/IUserRepository';
import type { IAuthorizationProviderService } from '../bounds/IAuthorizationProviderService';

interface RegistrationCommandProps {
  type: AuthorizationProviderTypes;
  loginData: unknown;
}

interface RegistrationCommandOutput {
  accessToken: string;
  refreshToken: string;
  userExists: boolean;
}

export class RegistrationCommand extends Command<
  RegistrationCommandProps,
  RegistrationCommandOutput
> {
  @Inject(ServiceTokens.AuthorizationProviderService)
  private readonly authorizationProviderService: IAuthorizationProviderService;

  @Inject(ReposTokens.UserRepository)
  private readonly userRepository: IUserRepository;

  @Inject(ServiceTokens.JWTService)
  private readonly jwtService: IJWTTokenService;

  async implementation(
    data: RegistrationCommandProps,
  ): Promise<RegistrationCommandOutput> {
    if (data.type == AuthorizationProviderTypes.LOCAL) {
      if (
        await this.userRepository.existsByEmail(
          (data.loginData as { email: string }).email,
        )
      )
        throw new BadRequestException('User with this email is already exists');
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
