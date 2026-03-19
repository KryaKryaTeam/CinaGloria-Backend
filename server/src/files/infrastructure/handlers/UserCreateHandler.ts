import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { EventHandler } from 'src/common/application/events/EventHandler';
import { EventType } from 'src/common/domain/EventType';
import { BaseTokens, ReposTokens, ServiceTokens } from 'src/common/Tokens';
import type { IFileRepository } from 'src/files/application/bounds/IFileRepository';
import { LinkerApplicationService } from 'src/files/application/services/Linker.appService';

@Injectable()
export class UserCreatedHandlerFile implements OnModuleInit {
  private readonly logger = new Logger(UserCreatedHandlerFile.name);
  constructor(
    @Inject(BaseTokens.EventHandler) private eventHandler: EventHandler,
    @Inject(ReposTokens.FileRepository)
    private readonly fileRepostory: IFileRepository,
    @Inject(ServiceTokens.FileLinkerService)
    private readonly linkerService: LinkerApplicationService,
  ) {}

  onModuleInit() {
    this.eventHandler.addListener(
      EventType.USER_CREATED,
      this.handle.bind(this),
    );
  }

  async handle(payload: UserEntity) {
    const file = await this.fileRepostory.findByUrl(payload.avatarURL.url);
    if (!file) throw new BadRequestException('File with this id is unefined!');

    await this.linkerService.linkAvatarToUser(file, payload);
    this.logger.log('User avatar linked to user');
  }
}
