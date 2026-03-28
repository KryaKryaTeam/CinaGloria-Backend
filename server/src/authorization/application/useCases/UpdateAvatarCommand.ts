import { Inject } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import { ReposTokens, ServiceTokens } from 'src/common/Tokens';
import type { IUserRepository } from '../bounds/IUserRepository';
import { PropsWithUserId } from 'src/types/PropsWithUserId';
import type { IFileRepository } from 'src/files/application/bounds/IFileRepository';
import { LinkerApplicationService } from 'src/files/application/services/Linker.appService';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { RelationSlots } from 'src/types/RelationSlots';
import { ApiError, FileErrors, UserErrors } from 'src/error/ApiError';

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
    if (!user) ApiError.throw(UserErrors.USER_WITH_THIS_ID_UNDEFINED);

    const file = await this.fileRepository.findByUrl(data.avatar);
    if (!file) ApiError.throw(FileErrors.FILE_WITH_THIS_ID_UNDEFINED);

    user!.changeAvatarURL(
      InternalFile.define<typeof RelationSlots.user.avatar>(
        data.avatar,
        'user:avatar',
        'user:avatar',
      ),
    );

    await this.fileLinkerService.linkAvatarToUser(file!, user!);

    await this.userRepository.save(user!);
  }
}
