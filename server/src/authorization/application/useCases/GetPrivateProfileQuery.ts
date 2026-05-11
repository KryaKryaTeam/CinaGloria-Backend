import { Inject } from '@nestjs/common';
import type { IPrivateProfile } from 'src/authorization/domain/entities/User.entity';
import { Query } from 'src/common/application/Query';
import { ReposTokens } from 'src/common/Tokens';
import type { IUserRepository } from '../bounds/IUserRepository';
import { ApiError, UserErrors } from 'src/error/ApiError';

export class GetPrivateProfileQuery extends Query<string, IPrivateProfile> {
  @Inject(ReposTokens.UserRepository)
  private userRepository: IUserRepository;

  async implementation(data: string): Promise<IPrivateProfile> {
    const user = await this.userRepository.findById(data);

    if (!user) ApiError.throw(UserErrors.USER_WITH_THIS_ID_UNDEFINED);

    return user.privateProfile;
  }
}
