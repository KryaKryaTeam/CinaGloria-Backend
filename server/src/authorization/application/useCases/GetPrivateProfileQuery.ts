import { BadRequestException, Inject } from '@nestjs/common';
import type { IPrivateProfile } from 'src/authorization/domain/entities/User.entity';
import { Query } from 'src/common/application/Query';
import { ReposTokens } from 'src/common/Tokens';
import type { IUserRepository } from '../bounds/IUserRepository';

export class GetPrivateProfileQuery extends Query<string, IPrivateProfile> {
  @Inject(ReposTokens.UserRepository)
  private userRepository: IUserRepository;

  async implementation(data: string): Promise<IPrivateProfile> {
    const user = await this.userRepository.findById(data);

    if (!user) throw new BadRequestException('User with this id is unedfined!');

    return user.privateProfile;
  }
}
