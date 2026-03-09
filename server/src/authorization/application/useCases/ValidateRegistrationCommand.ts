import { BadRequestException, Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import {
  IUserEntityJSON,
  UserEntity,
} from 'src/authorization/domain/entities/User.entity';
import { Command } from 'src/common/application/Command';
import { UserRepository } from 'src/common/infrastructure/repositories/UserRepository';
import { ReposTokens, ServiceTokens } from 'src/common/Tokens';
import type { IJWTTokenService } from '../bounds/IJWTTokenService';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

export class ValidateRegistrationCommand extends Command<
  {
    requestId: string;
    code: string;
  },
  { accessToken: string; refreshToken: string }
> {
  @Inject(CACHE_MANAGER)
  private readonly cacheService: Cache;

  @Inject(ReposTokens.UserRepository)
  private readonly userRepositiry: UserRepository;

  @Inject(ServiceTokens.JWTService)
  private readonly jwtService: IJWTTokenService;

  async implementation(data: {
    requestId: string;
    code: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const userAndCode = await this.cacheService.get<{
      code: string;
      user: IUserEntityJSON;
    }>(`registration:${data.requestId}`);

    if (!userAndCode) throw new BadRequestException('RequestId is incorrect');
    if (userAndCode.code != data.code)
      throw new BadRequestException('Validation code is incorrect');

    const user = UserEntity.load(userAndCode.user);

    user.pullEvents(this.eventDispatcher);

    await this.userRepositiry.save(user);

    const tokens = this.jwtService.sign({ sub: user.id, role: user.role });

    await this.cacheService.del(`registration:${data.requestId}`);

    return tokens;
  }
}
