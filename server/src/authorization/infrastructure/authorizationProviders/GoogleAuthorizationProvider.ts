import { AuthorizationProviderTypes } from 'src/types/AuthorizationProvidersTypes';
import {
  BaseAuthorizationProvider,
  IHandshakeOutput,
} from './BaseAuthorizationProvider';
import { AuthProviderEntity } from 'src/authorization/domain/entities/AuthProvider.entity';
import { randomUUID } from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthorizationProvider } from '../services/AuthorizationProviderService';

interface GoogleLoginData {
  token: string;
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
      const ticket = await this.OAuthClient.verifyIdToken({
        idToken: loginData.token,
        audience: this.configurationService.getOrThrow('google.clientId'),
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new BadRequestException('Invalid Google token');
      }

      if (!payload.email_verified) {
        throw new BadRequestException('Email not verified');
      }

      if (!payload.email || !payload.picture)
        throw new BadRequestException(
          'Email or Picture of this user is unedfined!',
        );

      return {
        authorizationData: payload.sub,
        avatarURL: payload.picture,
        email: payload.email,
      };
    } catch {
      throw new BadRequestException('Google authentication failed');
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
