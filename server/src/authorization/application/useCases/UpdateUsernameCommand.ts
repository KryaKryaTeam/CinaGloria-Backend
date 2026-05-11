import { Inject } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import { ReposTokens } from 'src/common/Tokens';
import type { IUserRepository } from '../bounds/IUserRepository';
import { PropsWithUserId } from 'src/types/PropsWithUserId';
import { ApiError, UserErrors } from 'src/error/ApiError';

export class UpdateUsernameCommand extends Command<
  PropsWithUserId<{ username: string }>,
  void
> {
  @Inject(ReposTokens.UserRepository)
  private readonly userRepository: IUserRepository;

  async implementation(data: { username: string; id: string }): Promise<void> {
    const user = await this.userRepository.findById(data.id);
    if (!user) ApiError.throw(UserErrors.USER_WITH_THIS_ID_UNDEFINED);

    await user!.changeUsername(data.username, async (t) => {
      return !(await this.userRepository.existsByUsername(t));
    });

    await this.userRepository.save(user!);
  }
}
