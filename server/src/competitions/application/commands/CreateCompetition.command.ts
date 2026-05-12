import { Inject } from '@nestjs/common';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Command } from 'src/common/application/Command';
import { ReposTokens, ServiceTokens } from 'src/common/Tokens';
import {
  CompetitionEntity,
  ICreateCompetitionRAW,
} from 'src/competitions/domain/entities/Competition.entity';
import type { IFileRepository } from 'src/files/application/bounds/IFileRepository';
import { LinkerApplicationService } from 'src/files/application/services/Linker.appService';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { RelationString } from 'src/files/domain/objects/RelationSlots';
import type { ICompetitionRepository } from '../bounds/CompetitionRepository';
import { UserAndCompetitionService } from 'src/competitions/domain/services/UserAndCompetitionService';
import { CompetitionRule } from 'src/competitions/domain/objects/CompetitionRule.object';
import { Icons } from 'src/types/Icons';
import { AppSlotCode } from 'src/types/RelationSlots';

interface CommandInput {
  user: UserEntity;
  competition: ICreateCompetitionRAW;
}

export class CreateCompetitionCommand extends Command<
  CommandInput,
  CompetitionEntity
> {
  @Inject(ReposTokens.FileRepository)
  private readonly fileRepository: IFileRepository;
  @Inject(ReposTokens.CompetitionRepository)
  private readonly competitionRepository: ICompetitionRepository;
  @Inject(ServiceTokens.FileLinkerService)
  private readonly linkerService: LinkerApplicationService;

  async implementation(data: CommandInput): Promise<CompetitionEntity> {
    const comp = UserAndCompetitionService.createCompetition(
      {
        ...data.competition,
        banner: undefined,
        avatar: undefined,
        socialMedia: undefined,
        ultraWideBanner: undefined,
        rules: [],
      },
      data.user,
    );

    await this.competitionRepository.save(comp);

    const fileMappings = [
      { url: data.competition.avatar, slot: 'competition:avatar' },
      { url: data.competition.banner, slot: 'competition:banner' },
      { url: data.competition.socialMedia, slot: 'competition:socialMedia' },
      {
        url: data.competition.ultraWideBanner,
        slot: 'competition:ultraWideBanner',
      },
    ];

    await Promise.all(
      fileMappings.map(async ({ url, slot }) => {
        if (!url) return;

        const file = await this.fileRepository.findByUrl(url);
        if (!file) return;

        const relation = RelationString.define(slot);

        await this.linkerService.linkFileToCompetitionSlot(
          file,
          comp,
          relation,
        );

        this.assignFileToEntity(comp, slot as AppSlotCode, file.url);
      }),
    );

    if (data.competition.rules)
      data.competition.rules.forEach((el) => {
        comp.addRule(
          CompetitionRule.define(el.name, el.description, el.icon as Icons),
        );
      });

    await this.competitionRepository.save(comp);

    return comp;
  }

  // Допоміжний метод, щоб не роздувати основну логіку
  private assignFileToEntity(
    comp: CompetitionEntity,
    slot: AppSlotCode,
    url: string,
  ) {
    if (slot === 'competition:avatar') {
      const internalFile = InternalFile.define<'competition:avatar'>(
        url,
        slot,
        'competition:avatar',
      );
      comp.avatar = internalFile;
    }

    if (slot === 'competition:banner') {
      const internalFile = InternalFile.define<'competition:banner'>(
        url,
        slot,
        'competition:banner',
      );
      comp.banner = internalFile;
    }
    if (slot === 'competition:socialMedia') {
      const internalFile = InternalFile.define<'competition:socialMedia'>(
        url,
        slot,
        'competition:socialMedia',
      );
      comp.socialMedia = internalFile;
    }
    if (slot === 'competition:ultraWideBanner') {
      const internalFile = InternalFile.define<'competition:ultraWideBanner'>(
        url,
        slot,
        'competition:ultraWideBanner',
      );
      comp.ultraWideBanner = internalFile;
    }
  }
}
