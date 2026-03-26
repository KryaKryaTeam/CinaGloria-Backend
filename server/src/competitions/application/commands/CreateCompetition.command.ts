import { Inject } from '@nestjs/common';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Command } from 'src/common/application/Command';
import { ReposTokens, ServiceTokens } from 'src/common/Tokens';
import {
  ICompetitionPlain,
  ICreateCompetitionRAW,
} from 'src/competitions/domain/entities/Competition.entity';
import type { IFileRepository } from 'src/files/application/bounds/IFileRepository';
import { LinkerApplicationService } from 'src/files/application/services/Linker.appService';
import { FileEntity } from 'src/files/domain/entities/File.entity';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { RelationString } from 'src/files/domain/objects/RelationSlots';
import { RelationSlots } from 'src/types/RelationSlots';
import type { ICompetitionRepository } from '../bounds/CompetitionRepository';
import { UserAndCompetitionService } from 'src/competitions/domain/services/UserAndCompetitionService';
import { CompetitionRule } from 'src/competitions/domain/objects/CompetitionRule.object';
import { Icons } from 'src/types/Icons';

interface CommandInput {
  user: UserEntity;
  competition: ICreateCompetitionRAW;
}

export class CreateCompetitionCommand extends Command<
  CommandInput,
  ICompetitionPlain
> {
  @Inject(ReposTokens.FileRepository)
  private readonly fileRepository: IFileRepository;

  @Inject(ReposTokens.CompetitionRepository)
  private readonly competitionRepository: ICompetitionRepository;

  @Inject(ServiceTokens.FileLinkerService)
  private readonly linkerService: LinkerApplicationService;

  async implementation(data: CommandInput): Promise<ICompetitionPlain> {
    const slots = [
      RelationString.define('competition:avatar'),
      RelationString.define('competition:banner'),
      RelationString.define('competition:socialMedia'),
      RelationString.define('competition:ulraWideBanner'),
    ];

    const files = [
      data.competition.avatar,
      data.competition.banner,
      data.competition.socialMedia,
      data.competition.ultraWideBanner,
    ].map(async (el, i) => {
      if (el) {
        const file = await this.fileRepository.findByUrl(el);
        if (!file) return null;
        await this.linkerService.linkFileToCompetitionSlot(
          file,
          comp,
          slots[i],
        );

        return file;
      } else return null;
    });

    const comp = UserAndCompetitionService.createCompetition(
      {
        ...data.competition,
        banner: null,
        avatar: null,
        socialMedia: null,
        ultraWideBanner: null,
        rules: [],
      },
      data.user,
    );

    const files_promised: (FileEntity | null)[] = await Promise.all(files);

    if (files_promised[0])
      comp.avatar = InternalFile.define<
        typeof RelationSlots.competition.avatar
      >(files_promised[0].url, 'competition:avatar', 'competition:avatar');

    if (files_promised[1])
      comp.banner = InternalFile.define<
        typeof RelationSlots.competition.banner
      >(files_promised[1].url, 'competition:banner', 'competition:banner');

    if (files_promised[2])
      comp.socialMedia = InternalFile.define<
        typeof RelationSlots.competition.socialMedia
      >(
        files_promised[2].url,
        'competition:socialMedia',
        'competition:socialMedia',
      );

    if (files_promised[3])
      comp.ultraWideBanner = InternalFile.define<
        typeof RelationSlots.competition.ultraWideBanner
      >(
        files_promised[3].url,
        'competition:ultraWideBanner',
        'competition:ultraWideBanner',
      );

    data.competition.rules.forEach((el) => {
      comp.addRule(
        CompetitionRule.define(el.name, el.description, el.icon as Icons),
      );
    });

    await this.competitionRepository.save(comp);

    return comp;
  }
}
