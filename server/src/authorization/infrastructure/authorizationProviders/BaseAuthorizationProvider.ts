import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IAuthProviderRepository } from 'src/authorization/application/bounds/IAuthProviderRepository';
import type { IUserRepository } from 'src/authorization/application/bounds/IUserRepository';
import { UserMapper } from 'src/authorization/application/mappers/UserMapper';
import { AuthProviderEntity } from 'src/authorization/domain/entities/AuthProvider.entity';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Username } from 'src/authorization/domain/objects/Username.object';
import {
  BaseTokens,
  MapperTokens,
  ReposTokens,
  ServiceTokens,
} from 'src/common/Tokens';
import { DomainError, DomainErrors } from 'src/error/DomainError';
import { AuthorizationProviderTypes } from 'src/types/AuthorizationProvidersTypes';
import { AuthorizationProviderService } from '../services/AuthorizationProviderService';
import { AvatarURL } from 'src/authorization/domain/objects/AvatarURL.object';
import type { IHashService } from 'src/authorization/application/bounds/IHashService';
import type { IEventDispatcher } from 'src/common/domain/IEventDispatcher';

export interface IHandshakeOutput {
  email: string;
  avatarURL: string;
  authorizationData: string; // Hash of password or providerId
}

@Injectable()
export abstract class BaseAuthorizationProvider<T> {
  protected abstract type: AuthorizationProviderTypes;

  @Inject(ReposTokens.UserRepository)
  protected userRepository: IUserRepository;

  @Inject(ReposTokens.AuthorizationProviderRepository)
  protected authProviderRepository: IAuthProviderRepository;

  @Inject(MapperTokens.UserMapper)
  protected userMapper: UserMapper;

  @Inject()
  protected configurationService: ConfigService;

  @Inject(ServiceTokens.AuthorizationProviderService)
  protected authorizartionProviderService: AuthorizationProviderService;

  @Inject(ServiceTokens.HashService)
  protected hashService: IHashService;

  @Inject(BaseTokens.EventDispatcher)
  private eventDispatcher: IEventDispatcher;

  async authorization(
    loginData: T,
  ): Promise<{ user: UserEntity; existsUser: boolean }> {
    if (!(await this.validate(loginData)))
      throw new DomainError(DomainErrors.UNEXPECTED_VALUE, 'Here');

    const handshakeData = await this.handshake(loginData);

    let findUser = await this.userRepository.findByEmail(handshakeData.email);

    let existsUser: boolean;
    if (!findUser) {
      existsUser = false;

      findUser = UserEntity.create(
        handshakeData.email,
        Username.generate(
          this.configurationService.getOrThrow('username.animals'),
          this.configurationService.getOrThrow('username.adjectives'),
        ),
        AvatarURL.create(handshakeData.avatarURL) ??
          AvatarURL.generate(
            this.configurationService.getOrThrow('avatar.list'),
          ),
      );

      if (this.type != AuthorizationProviderTypes.LOCAL)
        findUser.pullEvents(this.eventDispatcher);

      let hashed_LOCAL = handshakeData.authorizationData;

      if (this.type == AuthorizationProviderTypes.LOCAL)
        hashed_LOCAL = this.hashService.hash(hashed_LOCAL);
      const provider = this.createProvider(hashed_LOCAL);

      await findUser.linkProvider(provider, async (provider) => {
        return (
          (await this.authProviderRepository.findByProviderId(provider)) == null
        );
      });

      if (this.type != AuthorizationProviderTypes.LOCAL)
        await this.userRepository.save(findUser);
    } else {
      existsUser = true;
      if (
        !findUser.hasAuthorizationProvider(this.type) ||
        !findUser.isAuthorizationDataCorrect(
          handshakeData.authorizationData,
          this.hashService,
        )
      )
        throw new DomainError(DomainErrors.UNEXPECTED_VALUE);
    }
    return { user: findUser, existsUser };
  }

  abstract createProvider(loginData: string): AuthProviderEntity;
  abstract validate(loginData: T): Promise<boolean>;
  abstract handshake(loginData: T): Promise<IHandshakeOutput>;
}
