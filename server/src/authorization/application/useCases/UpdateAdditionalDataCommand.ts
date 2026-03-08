import { BadRequestException, Inject } from '@nestjs/common';
import { IUserAdditionalData } from 'src/authorization/domain/entities/User.entity';
import { Command } from 'src/common/application/Command';
import { ReposTokens } from 'src/common/Tokens';
import type { IUserRepository } from '../bounds/IUserRepository';
import { PropsWithUserId } from 'src/types/PropsWithUserId';

export class UpdateAdditionalDataCommand extends Command<
  PropsWithUserId<{ data: IUserAdditionalData }>,
  void
> {
  @Inject(ReposTokens.UserRepository)
  private userRepository: IUserRepository;

  async implementation(data: {
    data: IUserAdditionalData;
    id: string;
  }): Promise<void> {
    const user = await this.userRepository.findById(data.id);

    if (!user) throw new BadRequestException('User with this id is unedfined!');

    user.additionalData = data.data;
    await this.userRepository.save(user);
  }
}
