import { IJWTPair } from 'src/types/JWTPair';
import { IJWTPayload } from 'src/types/JWTPayload';

export interface IJWTTokenService {
  sign(payload: IJWTPayload): IJWTPair;
  refresh(refresh: string): Promise<IJWTPair>;
  checkAccess(access: string): boolean;
  decode(access: string): IJWTPayload;
}
