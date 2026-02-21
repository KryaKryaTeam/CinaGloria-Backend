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
import { AuthorizationProvider } from '../services/AuthorizationProviderService';

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
@AuthorizationProvider(AuthorizationProviderTypes.GOOGLE)
export class GoogleAuthorizationProvider extends BaseAuthorizationProvider<GoogleLoginData> {
  private _OAuthClient: OAuth2Client;
  private get OAuthClient() {
    if (!this._OAuthClient) {
      this._OAuthClient = new OAuth2Client({
        clientId: this.configurationService.getOrThrow('google.clientId'),
        clientSecret: this.configurationService.getOrThrow('google.secret'),
        redirectUri: this.configurationService.getOrThrow('google.redirectURI'),
      });
    }
    return this._OAuthClient;
  }

  protected type: AuthorizationProviderTypes =
    AuthorizationProviderTypes.GOOGLE;
  async validate(loginData: GoogleLoginData): Promise<boolean> {
    return new Promise((res) => res(loginData.token != null));
  }
  async handshake(loginData: GoogleLoginData): Promise<IHandshakeOutput> {
    try {
      const { tokens } = await this.OAuthClient.getToken(loginData.token);
      const res = (await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        },
      ).then((res) => res.json())) as GoogleResponse;

      if (!res.verified_email)
        throw new DomainError(DomainErrors.UNEXPECTED_VALUE, 'EMAIL!');

      return {
        authorizationData: res.id,
        avatarURL: res.picture,
        email: res.email,
      };
    } catch (err) {
      throw new DomainError(DomainErrors.UNEXPECTED_VALUE, JSON.stringify(err));
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
