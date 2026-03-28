import { Command } from 'src/common/application/Command';
import { IJWTPair } from 'src/types/JWTPair';
import type { IJWTTokenService } from '../bounds/IJWTTokenService';
import { Inject } from '@nestjs/common';
import { ServiceTokens } from 'src/common/Tokens';
import { ApiError, UserErrors } from 'src/error/ApiError';

export class RefreshCommand extends Command<string, IJWTPair> {
  @Inject(ServiceTokens.JWTService)
  private jwtTokenService: IJWTTokenService;

  async implementation(data: string): Promise<IJWTPair> {
    try {
      return await this.jwtTokenService.refresh(data);
    } catch {
      ApiError.throw(UserErrors.REFRESH_TOKEN_IS_INVALID);
    }
  }
}
