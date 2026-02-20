import { IAuthorizationProviderService } from 'src/authorization/application/bounds/IAuthorizationProviderService';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { AuthorizationProviderTypes } from 'src/types/AuthorizationProvidersTypes';
import { BaseAuthorizationProvider } from '../authorizationProviders/BaseAuthorizationProvider';
import { DomainError, DomainErrors } from 'src/error/DomainError';

export class AuthorizationProviderService implements IAuthorizationProviderService {
  providers: Map<
    AuthorizationProviderTypes,
    BaseAuthorizationProvider<unknown>
  >;
  async authorize(
    type: AuthorizationProviderTypes,
    loginData: unknown,
  ): Promise<UserEntity> {
    const provider = this.providers.get(type);
    if (!provider) throw new DomainError(DomainErrors.UNEXPECTED_VALUE);
    return await provider.authorization(loginData);
  }
  addProvider(
    type: AuthorizationProviderTypes,
    provider: BaseAuthorizationProvider<unknown>,
  ) {
    this.providers.set(type, provider);
  }
}
