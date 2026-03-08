import { Command } from 'src/common/application/Command';
import { IJWTPair } from 'src/types/JWTPair';
import type { IJWTTokenService } from '../bounds/IJWTTokenService';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { ServiceTokens } from 'src/common/Tokens';

export class RefreshCommand extends Command<string, IJWTPair> {
  @Inject(ServiceTokens.JWTService)
  private jwtTokenService: IJWTTokenService;

  async implementation(data: string): Promise<IJWTPair> {
    try {
      return await this.jwtTokenService.refresh(data);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
