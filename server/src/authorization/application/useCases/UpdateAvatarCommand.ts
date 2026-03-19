import { BadRequestException, Inject } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import { ReposTokens, ServiceTokens } from 'src/common/Tokens';
import type { IUserRepository } from '../bounds/IUserRepository';
import { PropsWithUserId } from 'src/types/PropsWithUserId';
import type { IFileRepository } from 'src/files/application/bounds/IFileRepository';
import { LinkerApplicationService } from 'src/files/application/services/Linker.appService';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { AppSlotCode } from 'src/types/RelationSlots';

export class UpdateAvatarCommand extends Command<
  PropsWithUserId<{ avatar: string }>,
  void
> {
  @Inject(ReposTokens.UserRepository)
  private readonly userRepository: IUserRepository;

  @Inject(ReposTokens.FileRepository)
  private readonly fileRepository: IFileRepository;

  @Inject(ServiceTokens.FileLinkerService)
  private readonly fileLinkerService: LinkerApplicationService;

  async implementation(data: { id: string; avatar: string }): Promise<void> {
    const user = await this.userRepository.findById(data.id);
    if (!user) throw new BadRequestException('User with this id is unedfined!');

    const file = await this.fileRepository.findByUrl(data.avatar);
    if (!file) throw new BadRequestException('File with this id is undefined');

    user.changeAvatarURL(
      InternalFile.define<AppSlotCode>(
        data.avatar,
        'user:avatar',
        'user:avatar',
      ),
    );

    await this.fileLinkerService.linkAvatarToUser(file, user);

    await this.userRepository.save(user);
  }
}
