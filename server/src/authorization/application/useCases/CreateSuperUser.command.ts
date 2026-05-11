import { Inject } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import { ReposTokens, ServiceTokens } from 'src/common/Tokens';
import type { IUserRepository } from '../bounds/IUserRepository';
import {
  ApiError,
  FileErrors,
  ServiceErrors,
  UserErrors,
} from 'src/error/ApiError';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Username } from 'src/authorization/domain/objects/Username.object';
import { RelationString } from 'src/files/domain/objects/RelationSlots';
import { Readable } from 'typeorm/platform/PlatformTools.js';
import type { IFileRepository } from 'src/files/application/bounds/IFileRepository';
import { FileEntity } from 'src/files/domain/entities/File.entity';
import { AvatarURL } from 'src/authorization/domain/objects/AvatarURL.object';
import { ConfigService } from '@nestjs/config';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { RelationSlots } from 'src/types/RelationSlots';
import { LoadFileService } from 'src/files/infrastructure/services/LoadFileService';
import { AuthProviderEntity } from 'src/authorization/domain/entities/AuthProvider.entity';
import type { IHashService } from '../bounds/IHashService';
import { AuthorizationProviderTypes } from 'src/types/AuthorizationProvidersTypes';
import { randomUUID } from 'crypto';
import { RoleEnum } from 'src/types/RoleEnum';
import { LinkerApplicationService } from 'src/files/application/services/Linker.appService';

interface CreateSuperUserCommandInput {
  email: string;
  password: string;
}

export class CreateSuperUserCommand extends Command<
  CreateSuperUserCommandInput,
  void
> {
  @Inject(ReposTokens.UserRepository)
  private readonly userRepository: IUserRepository;

  @Inject(ReposTokens.FileRepository)
  private readonly fileRepository: IFileRepository;

  @Inject(ServiceTokens.LoadFileService)
  private readonly loadFileService: LoadFileService;

  @Inject()
  private readonly configService: ConfigService;

  @Inject(ServiceTokens.HashService)
  private readonly hashService: IHashService;

  @Inject(ServiceTokens.FileLinkerService)
  private readonly linkerService: LinkerApplicationService;

  async implementation(data: CreateSuperUserCommandInput): Promise<void> {
    const userEx = await this.userRepository.existsByEmail(data.email);
    if (userEx) ApiError.throw(UserErrors.USER_BY_THIS_EMAIL_IS_EXISTS);

    const avatarURL = AvatarURL.generate(
      this.configService.getOrThrow('avatar.list'),
    ).value;

    let file: FileEntity;

    try {
      const response = await fetch(avatarURL, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*',
        },
      });

      if (!response.ok || !response.arrayBuffer)
        ApiError.throw(FileErrors.AVATAR_URL_UNAVAILABLE);
      const buffer = Buffer.from(await response.arrayBuffer());
      file = await this.loadFileService.loadFile(
        Readable.from(buffer),
        RelationString.define('user:avatar'),
      );

      await this.fileRepository.save(file);
    } catch (err) {
      if ((err as { code: number | undefined }).code) throw err;
      ApiError.throw(ServiceErrors.MISCONFIGURED);
    }

    const user = UserEntity.create(
      data.email,
      Username.generate(
        this.configService.getOrThrow('username.animals'),
        this.configService.getOrThrow('username.adjectives'),
      ),
      InternalFile.define<typeof RelationSlots.user.avatar>(
        file.url,
        'user:avatar',
        'user:avatar',
      ),
    );

    const authProvider = new AuthProviderEntity({
      passwordHash: this.hashService.hash(data.password),
      providerId: undefined,
      type: AuthorizationProviderTypes.LOCAL,
      id: randomUUID(),
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/require-await
    await user.linkProvider(authProvider, async (providerId: string) => {
      return true;
    });

    user.__forceSetRole(RoleEnum.ADMIN);

    await this.userRepository.save(user);

    await this.linkerService.linkAvatarToUser(file, user);
  }
}
