import { IPublicProfile } from 'src/authorization/domain/entities/User.entity';
import { Query } from 'src/common/application/Query';
import type { IUserRepository } from '../bounds/IUserRepository';
import { BadRequestException, Inject } from '@nestjs/common';
import { ReposTokens } from 'src/common/Tokens';

export class GetPublicProfileQuery extends Query<string, IPublicProfile> {
  @Inject(ReposTokens.UserRepository)
  private userRepository: IUserRepository;

  async implementation(data: string): Promise<IPublicProfile> {
    const user = await this.userRepository.findById(data);

    if (!user) throw new BadRequestException('User with this id is unedfined!');

    return user.publicProfile;
  }
}
