import { AuthorizationProviderTypes } from './AuthorizationProvidersTypes';
import { RoleEnum } from './RoleEnum';

export interface IJWTPayload {
  iat?: number;
  sub: string;
  role: RoleEnum;
  avatar: string;
  username: string;
  email: string;
  provider: AuthorizationProviderTypes;
}
