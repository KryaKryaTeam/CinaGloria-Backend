import {
  BaseAuthorizationProvider,
  IHandshakeOutput,
} from './BaseAuthorizationProvider';
import { AuthorizationProvider } from '../services/AuthorizationProviderService';
import { AuthorizationProviderTypes } from 'src/types/AuthorizationProvidersTypes';
import { AuthProviderEntity } from 'src/authorization/domain/entities/AuthProvider.entity';
import { randomUUID } from 'crypto';
import { AvatarURL } from 'src/authorization/domain/objects/AvatarURL.object';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { ServiceTokens } from 'src/common/Tokens';
import type { IHashService } from 'src/authorization/application/bounds/IHashService';
import { DomainError, DomainErrors } from 'src/error/DomainError';
import { connect } from 'http2';

interface LocalLoginData {
  email: string;
  password: string;
}

@AuthorizationProvider(AuthorizationProviderTypes.LOCAL)
export class LocalAuthorizationProvider extends BaseAuthorizationProvider<LocalLoginData> {
  protected type: AuthorizationProviderTypes = AuthorizationProviderTypes.LOCAL;
  @Inject()
  private readonly configService: ConfigService;
  @Inject(ServiceTokens.HashService)
  private readonly hashService: IHashService;

  createProvider(loginData: string): AuthProviderEntity {
    return new AuthProviderEntity({
      id: randomUUID(),
      passwordHash: loginData,
      providerId: '',
      type: AuthorizationProviderTypes.LOCAL,
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async handshake(loginData: LocalLoginData): Promise<IHandshakeOutput> {
    const passwordHash = this.hashService.hash(loginData.password);

    return {
      email: loginData.email,
      avatarURL: AvatarURL.generate(
        this.configService.getOrThrow('avatar.list'),
      ).value,
      authorizationData: passwordHash,
    };
  }

  async validate(loginData: LocalLoginData): Promise<boolean> {
    if (!loginData.password || !loginData.email) return false;

    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/.test(
        loginData.password,
      )
    ) {
      throw new DomainError(DomainErrors.UNEXPECTED_VALUE);
    }

    // if (await this.userRepository.existsByEmail(loginData.email)) return false;

    return true;
  }
}
