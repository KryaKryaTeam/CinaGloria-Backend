import { Inject } from '@nestjs/common';
import type { IPrivateProfile } from 'src/authorization/domain/entities/User.entity';
import { Query } from 'src/common/application/Query';
import { ReposTokens } from 'src/common/Tokens';
import type { IUserRepository } from '../bounds/IUserRepository';
import { DomainError, DomainErrors } from 'src/error/DomainError';

export class GetPrivateProfileQuery extends Query<string, IPrivateProfile> {
  @Inject(ReposTokens.UserRepository)
  private userRepository: IUserRepository;

  async implementation(data: string): Promise<IPrivateProfile> {
    const user = await this.userRepository.findById(data);
    if (!user) throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

    return user.privateProfile;
  }
}
