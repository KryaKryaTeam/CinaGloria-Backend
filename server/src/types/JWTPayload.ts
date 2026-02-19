import { AuthorizationProviderTypes } from './AuthorizationProvidersTypes';
import { RoleEnum } from './RoleEnum';

export interface JWTPayload {
  user_id: string;
  email: string;
  provider: AuthorizationProviderTypes;
  role: RoleEnum;
}
