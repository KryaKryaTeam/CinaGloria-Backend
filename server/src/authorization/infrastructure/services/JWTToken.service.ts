import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { IJWTTokenService } from 'src/authorization/application/bounds/IJWTTokenService';
import type { IUserRepository } from 'src/authorization/application/bounds/IUserRepository';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { ReposTokens } from 'src/common/Tokens';
import { IJWTPair } from 'src/types/JWTPair';
import { IJWTPayload } from 'src/types/JWTPayload';

@Injectable()
export class JWTTokenService implements IJWTTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configurationService: ConfigService,

    @Inject(ReposTokens.UserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  sign(payload: IJWTPayload): IJWTPair {
    const access = this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: this.configurationService.getOrThrow<string>('jwt.access_secret'),
    });

    const refresh = this.jwtService.sign(payload, {
      expiresIn: '15d',
      secret:
        this.configurationService.getOrThrow<string>('jwt.refresh_secret'),
    });

    return { accessToken: access, refreshToken: refresh };
  }

  async refresh(refresh: string): Promise<IJWTPair> {
    const decode = this.jwtService.verify<IJWTPayload>(refresh, {
      secret:
        this.configurationService.getOrThrow<string>('jwt.refresh_secret'),
    });

    const updatedUser = await this.userRepository.findById(decode.sub);
    if (!updatedUser) throw new UnauthorizedException('Invalid refresh token');

    return this.sign({
      sub: updatedUser.id,
      role: updatedUser.role,
    });
  }

  checkAccess(access: string): boolean {
    try {
      this.jwtService.verify<UserEntity>(access, {
        secret:
          this.configurationService.getOrThrow<string>('jwt.access_secret'),
      });
      return true;
    } catch {
      throw new UnauthorizedException('Access token is invalid!');
    }
  }

  decode(access: string): IJWTPayload {
    return this.jwtService.decode(access);
  }
}
