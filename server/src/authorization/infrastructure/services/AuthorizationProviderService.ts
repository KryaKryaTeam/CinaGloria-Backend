import { IAuthorizationProviderService } from 'src/authorization/application/bounds/IAuthorizationProviderService';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { AuthorizationProviderTypes } from 'src/types/AuthorizationProvidersTypes';
import { BaseAuthorizationProvider } from '../authorizationProviders/BaseAuthorizationProvider';
import { DomainError, DomainErrors } from 'src/error/DomainError';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

export const AuthorizationProvider = DiscoveryService.createDecorator();

@Injectable()
export class AuthorizationProviderService
  implements IAuthorizationProviderService, OnModuleInit
{
  private providers: Map<
    AuthorizationProviderTypes,
    BaseAuthorizationProvider<unknown>
  > = new Map();
  private readonly logger = new Logger(AuthorizationProviderService.name);

  @Inject()
  private readonly discoveryService: DiscoveryService;

  onModuleInit() {
    const providers = this.discoveryService.getProviders();

    providers.forEach((el) => {
      if (
        !this.discoveryService.getMetadataByDecorator(AuthorizationProvider, el)
      )
        return;

      this.addProvider(
        this.discoveryService.getMetadataByDecorator(
          AuthorizationProvider,
          el,
        ) as AuthorizationProviderTypes,
        el.instance as BaseAuthorizationProvider<unknown>,
      );
    });
  }

  async authorize(
    type: AuthorizationProviderTypes,
    loginData: unknown,
  ): Promise<UserEntity> {
    const provider = this.providers.get(type);
    if (!provider) throw new DomainError(DomainErrors.UNEXPECTED_VALUE);
    return await provider.authorization(loginData);
  }
  addProvider(
    type: AuthorizationProviderTypes,
    provider: BaseAuthorizationProvider<unknown>,
  ) {
    this.logger.log(`New authorization provider added: ${type}`);
    this.providers.set(type, provider);
  }
}
