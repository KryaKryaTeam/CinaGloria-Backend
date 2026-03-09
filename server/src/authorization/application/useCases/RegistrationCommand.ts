import { BadRequestException, Inject } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import { ReposTokens, ServiceTokens } from 'src/common/Tokens';
import { AuthorizationProviderTypes } from 'src/types/AuthorizationProvidersTypes';
import type { IJWTTokenService } from '../bounds/IJWTTokenService';
import type { IUserRepository } from '../bounds/IUserRepository';
import type { IAuthorizationProviderService } from '../bounds/IAuthorizationProviderService';
import { Cache } from '@nestjs/cache-manager';
import { randomInt, randomUUID } from 'crypto';
import { SendNotificationEvent } from 'src/notification/domain/events/SendNotificationEvent';
import { Notification } from 'src/notification/domain/entities/Notification';

interface RegistrationCommandProps {
  type: AuthorizationProviderTypes;
  loginData: unknown;
}

interface RegistrationCommandOutput {
  requestId: string;
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

  @Inject(Cache)
  private readonly cacheService: Cache;

  async implementation(
    data: RegistrationCommandProps,
  ): Promise<RegistrationCommandOutput> {
    if (data.type !== AuthorizationProviderTypes.LOCAL) {
      throw new BadRequestException(
        'This endpoint service only Local Provider',
      );
    }

    const loginData = data.loginData as { email: string };
    if (await this.userRepository.existsByEmail(loginData.email)) {
      throw new BadRequestException('User with this email is already exists');
    }

    const { user } = await this.authorizationProviderService.authorize(
      data.type,
      data.loginData,
    );
    const requestId = randomUUID();
    const code = randomInt(100000, 1000000).toString();

    await this.cacheService.set(
      `registration:${requestId}`,
      { user: user.toJSON(), code },
      900000,
    );

    this.eventDispatcher.addEvent(
      new SendNotificationEvent(
        Notification.create({
          to: user,
          content: `code:${code}`,
          from: 'System',
          targets: ['email'],
          title: 'Verification Code',
        }),
      ),
    );

    return { requestId };
  }
}
