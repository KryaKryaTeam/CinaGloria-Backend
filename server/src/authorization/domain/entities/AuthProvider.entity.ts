import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { IHashService } from 'src/authorization/application/bounds/IHashService';
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
      throw new BadRequestException('Incorrect data for this provider');

    if (
      partial.type != AuthorizationProviderTypes.LOCAL &&
      (partial.passwordHash || !partial.providerId)
    )
      throw new BadRequestException('Incorrect data for this provider');

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
      throw new ForbiddenException();
    this.passwordHash = hash;
  }

  setProviderId(id: string) {
    if (this.type == AuthorizationProviderTypes.LOCAL)
      throw new ForbiddenException();

    if (this.providerId && typeof this.providerId !== 'undefined')
      throw new ForbiddenException();

    this.providerId = id;
  }

  getProviderId() {
    if (this.type != AuthorizationProviderTypes.LOCAL)
      return this.providerId as string;
    throw new ForbiddenException();
  }

  getPasswordHash() {
    if (this.type == AuthorizationProviderTypes.LOCAL)
      return this.passwordHash as string;
    throw new ForbiddenException();
  }
}
