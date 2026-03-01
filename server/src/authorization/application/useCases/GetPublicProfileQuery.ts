import { IPublicProfile } from 'src/authorization/domain/entities/User.entity';
import { Query } from 'src/common/application/Query';
import type { IUserRepository } from '../bounds/IUserRepository';
import { Inject } from '@nestjs/common';
import { ReposTokens } from 'src/common/Tokens';
import { DomainError, DomainErrors } from 'src/error/DomainError';

export class GetPublicProfileQuery extends Query<string, IPublicProfile> {
  @Inject(ReposTokens.UserRepository)
  private userRepository: IUserRepository;

  async implementation(data: string): Promise<IPublicProfile> {
    const user = await this.userRepository.findById(data);

    if (!user) throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

    return user.publicProfile;
  }
}
