import { AuthorizationProviderTypes } from 'src/types/AuthorizationProvidersTypes';
import {
  BaseAuthorizationProvider,
  IHandshakeOutput,
} from './BaseAuthorizationProvider';
import { AuthProviderEntity } from 'src/authorization/domain/entities/AuthProvider.entity';
import { randomUUID } from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { Injectable } from '@nestjs/common';
import { DomainError, DomainErrors } from 'src/error/DomainError';
import { gaxios } from 'google-auth-library';

interface GoogleLoginData {
  token: string;
}

interface GoogleResponse {
  picture: string;
  email: string;
  verified_email: boolean;
  id: string;
}

@Injectable()
export class GoogleAuthorizationProvider extends BaseAuthorizationProvider<GoogleLoginData> {
  private get OAuthClient() {
    return new OAuth2Client({
      clientId: this.configurationService.getOrThrow('google.clientId'),
      clientSecret: this.configurationService.getOrThrow('google.secret'),
    });
  }
  protected type: AuthorizationProviderTypes =
    AuthorizationProviderTypes.GOOGLE;
  async validate(loginData: GoogleLoginData): Promise<boolean> {
    return new Promise((res) => res(loginData.token != null));
  }
  async handshake(loginData: GoogleLoginData): Promise<IHandshakeOutput> {
    try {
      const access = await this.OAuthClient.getToken(loginData.token);
      this.OAuthClient.setCredentials(access.tokens);
      const { data }: gaxios.GaxiosResponse<GoogleResponse> =
        await this.OAuthClient.fetch(
          'https://www.googleapis.com/oauth2/v2/userinfo',
        );

      if (!data.verified_email)
        throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

      return {
        authorizationData: data.id,
        avatarURL: data.picture,
        email: data.email,
      };
    } catch {
      throw new DomainError(DomainErrors.UNEXPECTED_VALUE);
    }
  }
  createProvider(loginData: string): AuthProviderEntity {
    return new AuthProviderEntity({
      id: randomUUID(),
      passwordHash: '',
      providerId: loginData,
      type: AuthorizationProviderTypes.GOOGLE,
    });
  }
}
