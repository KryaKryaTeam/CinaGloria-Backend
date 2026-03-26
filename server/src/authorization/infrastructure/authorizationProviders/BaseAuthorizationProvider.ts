import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IAuthProviderRepository } from 'src/authorization/application/bounds/IAuthProviderRepository';
import type { IUserRepository } from 'src/authorization/application/bounds/IUserRepository';
import { UserMapper } from 'src/authorization/application/mappers/UserMapper';
import { AuthProviderEntity } from 'src/authorization/domain/entities/AuthProvider.entity';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Username } from 'src/authorization/domain/objects/Username.object';
import {
  BaseTokens,
  MapperTokens,
  ReposTokens,
  ServiceTokens,
} from 'src/common/Tokens';
import { DomainError, DomainErrors } from 'src/error/DomainError';
import { AuthorizationProviderTypes } from 'src/types/AuthorizationProvidersTypes';
import { AuthorizationProviderService } from '../services/AuthorizationProviderService';
import type { IHashService } from 'src/authorization/application/bounds/IHashService';
import type { IEventDispatcher } from 'src/common/domain/IEventDispatcher';
import type { ILoadFileService } from 'src/files/application/bounds/ILoadFileService';
import { Readable } from 'stream';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { RelationSlots } from 'src/types/RelationSlots';
import type { IFileRepository } from 'src/files/application/bounds/IFileRepository';
import { FileEntity } from 'src/files/domain/entities/File.entity';
import { RelationString } from 'src/files/domain/objects/RelationSlots';

export interface IHandshakeOutput {
  email: string;
  avatarURL: string;
  authorizationData: string; // Hash of password or providerId
}

@Injectable()
export abstract class BaseAuthorizationProvider<T> {
  protected abstract type: AuthorizationProviderTypes;

  @Inject(ReposTokens.UserRepository)
  protected userRepository: IUserRepository;

  @Inject(ReposTokens.AuthorizationProviderRepository)
  protected authProviderRepository: IAuthProviderRepository;

  @Inject(MapperTokens.UserMapper)
  protected userMapper: UserMapper;

  @Inject()
  protected configurationService: ConfigService;

  @Inject(ServiceTokens.AuthorizationProviderService)
  protected authorizartionProviderService: AuthorizationProviderService;

  @Inject(ServiceTokens.HashService)
  protected hashService: IHashService;

  @Inject(BaseTokens.EventDispatcher)
  private eventDispatcher: IEventDispatcher;

  @Inject(ServiceTokens.LoadFileService)
  private readonly loadFileService: ILoadFileService;

  @Inject(ReposTokens.FileRepository)
  private readonly fileRepostory: IFileRepository;

  async authorization(
    loginData: T,
  ): Promise<{ user: UserEntity; existsUser: boolean }> {
    if (!(await this.validate(loginData)))
      throw new DomainError(DomainErrors.UNEXPECTED_VALUE, 'Here');

    const handshakeData = await this.handshake(loginData);

    let findUser = await this.userRepository.findByEmail(handshakeData.email);

    let existsUser: boolean;
    if (!findUser) {
      existsUser = false;

      let file: FileEntity;

      try {
        const response = await fetch(handshakeData.avatarURL, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept:
              'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*',
          },
        });

        if (!response.ok || !response.arrayBuffer)
          throw new BadRequestException('Avatar by this url is unavalible!');
        const buffer = Buffer.from(await response.arrayBuffer());
        file = await this.loadFileService.loadFile(
          Readable.from(buffer),
          RelationString.define('user:avatar'),
        );

        await this.fileRepostory.save(file);
      } catch (err) {
        if ((err as { code: number | undefined }).code) throw err;
        throw new InternalServerErrorException('Failed to fecth avatar!');
      }

      findUser = UserEntity.create(
        handshakeData.email,
        Username.generate(
          this.configurationService.getOrThrow('username.animals'),
          this.configurationService.getOrThrow('username.adjectives'),
        ),
        InternalFile.define<typeof RelationSlots.user.avatar>(
          `internal_file:${file.url}`,
          'user:avatar',
          'user:avatar',
        ),
      );

      if (this.type != AuthorizationProviderTypes.LOCAL)
        findUser.pullEvents(this.eventDispatcher);

      let hashed_LOCAL = handshakeData.authorizationData;

      if (this.type == AuthorizationProviderTypes.LOCAL)
        hashed_LOCAL = this.hashService.hash(hashed_LOCAL);
      const provider = this.createProvider(hashed_LOCAL);

      await findUser.linkProvider(provider, async (provider) => {
        return (
          (await this.authProviderRepository.findByProviderId(provider)) == null
        );
      });

      if (this.type != AuthorizationProviderTypes.LOCAL) {
        await this.userRepository.save(findUser);
      }
    } else {
      existsUser = true;
      if (
        !findUser.hasAuthorizationProvider(this.type) ||
        !findUser.isAuthorizationDataCorrect(
          handshakeData.authorizationData,
          this.hashService,
        )
      )
        throw new DomainError(DomainErrors.UNEXPECTED_VALUE);
    }
    return { user: findUser, existsUser };
  }

  abstract createProvider(loginData: string): AuthProviderEntity;
  abstract validate(loginData: T): Promise<boolean>;
  abstract handshake(loginData: T): Promise<IHandshakeOutput>;
}
