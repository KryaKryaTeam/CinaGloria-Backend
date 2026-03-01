import { Inject } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import { ReposTokens } from 'src/common/Tokens';
import type { IUserRepository } from '../bounds/IUserRepository';
import { DomainError, DomainErrors } from 'src/error/DomainError';

export class UpdateUsernameCommand extends Command<
  { username: string; id: string },
  void
> {
  @Inject(ReposTokens.UserRepository)
  private readonly userRepository: IUserRepository;

  async implementation(data: { username: string; id: string }): Promise<void> {
    const user = await this.userRepository.findById(data.id);
    if (!user) throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

    await user.changeUsername(data.username, async (t) => {
      return !(await this.userRepository.existsByUsername(t));
    });

    await this.userRepository.save(user);
  }
}
