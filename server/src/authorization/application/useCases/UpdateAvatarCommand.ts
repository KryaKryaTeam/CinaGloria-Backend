import { Inject } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import { ReposTokens } from 'src/common/Tokens';
import type { IUserRepository } from '../bounds/IUserRepository';
import { DomainError, DomainErrors } from 'src/error/DomainError';
import { AvatarURL } from 'src/authorization/domain/objects/AvatarURL.object';

export class UpdateAvatarCommand extends Command<
  { id: string; avatar: string },
  void
> {
  @Inject(ReposTokens.UserRepository)
  private readonly userRepository: IUserRepository;
  async implementation(data: { id: string; avatar: string }): Promise<void> {
    const user = await this.userRepository.findById(data.id);
    if (!user) throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

    user.changeAvatarURL(AvatarURL.create(data.avatar));
    await this.userRepository.save(user);
  }
}
