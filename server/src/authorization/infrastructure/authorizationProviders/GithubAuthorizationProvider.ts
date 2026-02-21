import { Body, Injectable } from '@nestjs/common';
import { AuthorizationProvider } from '../services/AuthorizationProviderService';
import { AuthorizationProviderTypes } from 'src/types/AuthorizationProvidersTypes';
import {
  BaseAuthorizationProvider,
  IHandshakeOutput,
} from './BaseAuthorizationProvider';
import { AuthProviderEntity } from 'src/authorization/domain/entities/AuthProvider.entity';
import { randomUUID } from 'crypto';
import { DomainError, DomainErrors } from 'src/error/DomainError';

interface GithubLoginData {
  token: string;
}

interface GithubAccessTokenResponse {
  access_token: string;
  scopes: string[];
}

interface GithubProfileData {
  avatar_url: string;
  id: string;
}

interface GithubEmail {
  email: string;
  verified: boolean;
  primary: boolean;
  visibility: 'public' | 'private';
}

@Injectable()
@AuthorizationProvider(AuthorizationProviderTypes.GITHUB)
export class GithubAuthorizationProvider extends BaseAuthorizationProvider<GithubLoginData> {
  protected type: AuthorizationProviderTypes =
    AuthorizationProviderTypes.GITHUB;
  createProvider(loginData: string): AuthProviderEntity {
    return new AuthProviderEntity({
      id: randomUUID(),
      passwordHash: '',
      providerId: loginData,
      type: AuthorizationProviderTypes.GITHUB,
    });
  }
  async handshake(loginData: GithubLoginData): Promise<IHandshakeOutput> {
    try {
      const accessToken = (await fetch(
        'https://github.com/login/oauth/access_token',
        {
          body: JSON.stringify({
            client_id:
              this.configurationService.getOrThrow<string>('githib.clientId'),
            client_secret:
              this.configurationService.getOrThrow<string>('githib.secret'),
            code: loginData.token,
          }),
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          method: 'POST',
        },
      ).then((res) => res.json())) as GithubAccessTokenResponse;

      if (
        !accessToken.scopes.includes('user:email') ||
        !accessToken.scopes.includes('read:user')
      )
        throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

      const profileData = (await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken.access_token}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'CinaGloria-Auth-Service',
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }).then((res) => res.json())) as GithubProfileData;

      const emails = (await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken.access_token}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'CinaGloria-Auth-Service',
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }).then((res) => res.json())) as GithubEmail[];

      const primaryEmail = emails.find(
        (email) => email.verified && email.primary,
      );

      if (!primaryEmail || !profileData.avatar_url || !profileData.id)
        throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

      return {
        avatarURL: profileData.avatar_url,
        authorizationData: profileData.id,
        email: primaryEmail.email,
      };
    } catch (err) {
      if (!(err instanceof DomainError)) {
        throw new DomainError(DomainErrors.UNEXPECTED_VALUE);
      } else throw err;
    }
  }
  validate(loginData: GithubLoginData): Promise<boolean> {
    return new Promise((res) => res(loginData.token != null));
  }
}
