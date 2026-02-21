import { Inject, Injectable } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import type { IAuthorizationProviderService } from '../bounds/IAuthorizationProviderService';
import type { IUserRepository } from '../bounds/IUserRepository';
import { ReposTokens, ServiceTokens } from 'src/common/Tokens';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Username } from 'src/authorization/domain/objects/Username.object';
import { AvatarURL } from 'src/authorization/domain/objects/AvatarURL.object';

interface LoginCommandOutput {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class CheckCommand extends Command<null, LoginCommandOutput> {
  @Inject(ServiceTokens.AuthorizationProviderService)
  authorizationProviderService: IAuthorizationProviderService;

  @Inject(ReposTokens.UserRepository)
  userRepository: IUserRepository;

  async implementation(): Promise<LoginCommandOutput> {
    const user = UserEntity.create(
      'admin@gmail.com',
      Username.generate(['s', 'ss'], ['ss', 'sss']),
      AvatarURL.generate(['https://example.com']),
    );

    console.log(this.userRepository);

    console.log(await this.userRepository.findByEmail('admin@gmail.com'));

    await this.userRepository.save(user);

    return {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
    };
  }
}
