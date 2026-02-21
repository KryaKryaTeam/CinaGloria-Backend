import { IJWTPair } from 'src/types/JWTPair';

export interface IJWTTokenService {
  sign(payload: unknown): IJWTPair;
  refresh(refresh: string): Promise<IJWTPair>;
  checkAccess(access: string): boolean;
}
