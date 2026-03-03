import { Inject } from '@nestjs/common';
import { IUserAdditionalData } from 'src/authorization/domain/entities/User.entity';
import { Command } from 'src/common/application/Command';
import { ReposTokens } from 'src/common/Tokens';
import type { IUserRepository } from '../bounds/IUserRepository';
import { DomainError, DomainErrors } from 'src/error/DomainError';
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
    if (!user) throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

    user.additionalData = data.data;
    await this.userRepository.save(user);
  }
}
