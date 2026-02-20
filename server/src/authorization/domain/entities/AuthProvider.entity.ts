import { DomainError, DomainErrors } from 'src/error/DomainError';
import { AuthorizationProviderTypes } from 'src/types/AuthorizationProvidersTypes';

interface IAuthProviderConstructorProps {
  id: string;
  type: AuthorizationProviderTypes;
  passwordHash: string;
  providerId: string;
}

export class AuthProviderEntity {
  public readonly id: string;
  public readonly type: AuthorizationProviderTypes;
  private passwordHash?: string;
  private providerId?: string;

  constructor(partial: IAuthProviderConstructorProps) {
    if (
      partial.type == AuthorizationProviderTypes.LOCAL &&
      (!partial.passwordHash || partial.providerId)
    )
      throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

    if (
      partial.type != AuthorizationProviderTypes.LOCAL &&
      (partial.passwordHash || !partial.providerId)
    )
      throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

    Object.assign(this, partial);
  }

  isType(type: AuthorizationProviderTypes) {
    return this.type == type;
  }

  isDataEqual(data: string) {
    if (this.type == AuthorizationProviderTypes.LOCAL) {
      return data == this.passwordHash;
    } else {
      return data == this.providerId;
    }
  }

  setPasswordHash(hash: string) {
    if (this.type != AuthorizationProviderTypes.LOCAL)
      throw new DomainError(DomainErrors.RESTRICTED_CHANGE);
    this.passwordHash = hash;
  }

  setProviderId(id: string) {
    if (this.type == AuthorizationProviderTypes.LOCAL)
      throw new DomainError(DomainErrors.RESTRICTED_CHANGE);

    if (this.providerId && typeof this.providerId !== 'undefined')
      throw new DomainError(DomainErrors.IMMUTABLE_VALUE);

    this.providerId = id;
  }

  getProviderId() {
    if (this.type != AuthorizationProviderTypes.LOCAL)
      return this.providerId as string;
    throw new DomainError(DomainErrors.RESTRICTED_QUERY);
  }

  getPasswordHash() {
    if (this.type == AuthorizationProviderTypes.LOCAL)
      return this.passwordHash as string;
    throw new DomainError(DomainErrors.RESTRICTED_QUERY);
  }
}
