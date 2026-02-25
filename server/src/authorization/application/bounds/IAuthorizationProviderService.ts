import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { AuthorizationProviderTypes } from 'src/types/AuthorizationProvidersTypes';

export interface IAuthorizationProviderService {
  authorize(
    type: AuthorizationProviderTypes,
    loginData: unknown,
  ): Promise<UserEntity>;
}
