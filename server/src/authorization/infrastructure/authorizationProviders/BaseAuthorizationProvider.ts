import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IAuthProviderRepository } from 'src/authorization/application/bounds/IAuthProviderRepository';
import type { IUserRepository } from 'src/authorization/application/bounds/IUserRepository';
import { UserMapper } from 'src/authorization/application/mappers/UserMapper';
import { AuthProviderEntity } from 'src/authorization/domain/entities/AuthProvider.entity';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Username } from 'src/authorization/domain/objects/Username.object';
import { MapperTokens, ReposTokens, ServiceTokens } from 'src/common/Tokens';
import { DomainError, DomainErrors } from 'src/error/DomainError';
import { AuthorizationProviderTypes } from 'src/types/AuthorizationProvidersTypes';
import { AuthorizationProviderService } from '../services/AuthorizationProviderService';
import { AvatarURL } from 'src/authorization/domain/objects/AvatarURL.object';

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

  async authorization(loginData: T): Promise<UserEntity> {
    if (!(await this.validate(loginData)))
      throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

    const handshakeData = await this.handshake(loginData);

    let findUser = await this.userRepository.findByEmail(handshakeData.email);

    if (!findUser) {
      findUser = UserEntity.create(
        handshakeData.email,
        Username.generate(
          this.configurationService.getOrThrow('username.animals'),
          this.configurationService.getOrThrow('username.adjectives'),
        ),
        AvatarURL.generate(this.configurationService.getOrThrow('avatar.list')),
      );

      const provider = this.createProvider(handshakeData.authorizationData);

      await findUser.linkProvider(provider, async (provider) => {
        return (
          (await this.authProviderRepository.findByProviderId(provider)) == null
        );
      });

      await this.userRepository.save(findUser);
    } else {
      if (
        !findUser.hasAuthorizationProvider(this.type) ||
        !findUser.isAuthorizationDataCorrect(handshakeData.authorizationData)
      )
        throw new DomainError(DomainErrors.UNEXPECTED_VALUE);
    }
    return findUser;
  }

  abstract createProvider(loginData: string): AuthProviderEntity;
  abstract validate(loginData: T): Promise<boolean>;
  abstract handshake(loginData: T): Promise<IHandshakeOutput>;
}
