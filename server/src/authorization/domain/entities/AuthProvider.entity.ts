import { IHashService } from 'src/authorization/application/bounds/IHashService';
import { ApiError, UserErrors } from 'src/error/ApiError';
import { AuthorizationProviderTypes } from 'src/types/AuthorizationProvidersTypes';

export interface IAuthProviderConstructorProps {
  id: string;
  type: AuthorizationProviderTypes;
  passwordHash: string | undefined;
  providerId: string | undefined;
}

export class AuthProviderEntity {
  public readonly id: string;
  public readonly type: AuthorizationProviderTypes;
  private passwordHash?: string;
  private providerId?: string;

  toJSON(): IAuthProviderConstructorProps {
    return {
      id: this.id,
      type: this.type,
      passwordHash: this.passwordHash,
      providerId: this.providerId,
    };
  }

  constructor(partial: IAuthProviderConstructorProps) {
    if (
      partial.type == AuthorizationProviderTypes.LOCAL &&
      (!partial.passwordHash || partial.providerId)
    )
      ApiError.throw(UserErrors.INCORRECT_PROVIDER_DATA);

    if (
      partial.type != AuthorizationProviderTypes.LOCAL &&
      (partial.passwordHash || !partial.providerId)
    )
      ApiError.throw(UserErrors.INCORRECT_PROVIDER_DATA);

    Object.assign(this, partial);
  }

  isType(type: AuthorizationProviderTypes) {
    return this.type == type;
  }

  isDataEqual(data: string, hashService: IHashService) {
    if (this.type == AuthorizationProviderTypes.LOCAL) {
      return hashService.compare(data, this.passwordHash as string);
    } else {
      return data == this.providerId;
    }
  }

  setPasswordHash(hash: string) {
    if (this.type != AuthorizationProviderTypes.LOCAL)
      ApiError.throw(UserErrors.DENIED_BY_AUTH_PROVIDER);
    this.passwordHash = hash;
  }

  setProviderId(id: string) {
    if (this.type == AuthorizationProviderTypes.LOCAL)
      ApiError.throw(UserErrors.DENIED_BY_AUTH_PROVIDER);
    if (this.providerId && typeof this.providerId !== 'undefined')
      ApiError.throw(UserErrors.DENIED_BY_AUTH_PROVIDER);

    this.providerId = id;
  }

  getProviderId(): string {
    if (this.type != AuthorizationProviderTypes.LOCAL)
      return this.providerId as string;
    ApiError.throw(UserErrors.DENIED_BY_AUTH_PROVIDER);
    return '';
  }

  getPasswordHash(): string {
    if (this.type == AuthorizationProviderTypes.LOCAL)
      return this.passwordHash as string;
    ApiError.throw(UserErrors.DENIED_BY_AUTH_PROVIDER);
    return '';
  }
}
