import { BadRequestException, Inject } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import { ReposTokens } from 'src/common/Tokens';
import type { IUserRepository } from '../bounds/IUserRepository';
import { AvatarURL } from 'src/authorization/domain/objects/AvatarURL.object';
import { PropsWithUserId } from 'src/types/PropsWithUserId';

export class UpdateAvatarCommand extends Command<
  PropsWithUserId<{ avatar: string }>,
  void
> {
  @Inject(ReposTokens.UserRepository)
  private readonly userRepository: IUserRepository;
  async implementation(data: { id: string; avatar: string }): Promise<void> {
    const user = await this.userRepository.findById(data.id);
    if (!user) throw new BadRequestException('User with this id is unedfined!');

    user.changeAvatarURL(AvatarURL.create(data.avatar));
    await this.userRepository.save(user);
  }
}
