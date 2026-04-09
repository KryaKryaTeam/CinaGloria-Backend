import { Inject } from '@nestjs/common';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Command } from 'src/common/application/Command';
import { ReposTokens, ServiceTokens } from 'src/common/Tokens';
import { ICreateCompetitionRAW } from 'src/competitions/domain/entities/Competition.entity';
import type { ICompetitionRepository } from '../bounds/CompetitionRepository';
import { UserAndCompetitionService } from 'src/competitions/domain/services/UserAndCompetitionService';
import { RelationString } from 'src/files/domain/objects/RelationSlots';
import { FileEntity } from 'src/files/domain/entities/File.entity';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { RelationSlots } from 'src/types/RelationSlots';
import { LinkerApplicationService } from 'src/files/application/services/Linker.appService';
import type { IFileRepository } from 'src/files/application/bounds/IFileRepository';
import { ApiError, CompetitionErrors } from 'src/error/ApiError';

interface UpdateCompetitionCommandInput {
  competitionId: string;
  user: UserEntity;
  competitionData: ICreateCompetitionRAW;
}

export class UpdateCompetitionCommand extends Command<
  UpdateCompetitionCommandInput,
  void
> {
  @Inject(ReposTokens.FileRepository)
  private readonly fileRepository: IFileRepository;

  @Inject(ReposTokens.CompetitionRepository)
  private readonly competitionRepository: ICompetitionRepository;

  @Inject(ServiceTokens.FileLinkerService)
  private readonly linkerService: LinkerApplicationService;

  async implementation(data: UpdateCompetitionCommandInput): Promise<void> {
    const competition = await this.competitionRepository.findById(
      data.competitionId,
    );

    if (!competition) ApiError.throw(CompetitionErrors.UNDEFINED);

    const slots = [
      RelationString.define('competition:avatar'),
      RelationString.define('competition:banner'),
      RelationString.define('competition:socialMedia'),
      RelationString.define('competition:ulraWideBanner'),
    ];

    const files = [
      data.competitionData.avatar,
      data.competitionData.banner,
      data.competitionData.socialMedia,
      data.competitionData.ultraWideBanner,
    ].map(async (el, i) => {
      if (el) {
        const file = await this.fileRepository.findByUrl(el);
        if (!file) return undefined;
        await this.linkerService.linkFileToCompetitionSlot(
          file,
          competition,
          slots[i],
        );

        return file;
      } else return undefined;
    });

    const files_promised: (FileEntity | undefined)[] = await Promise.all(files);

    const files_mapped = {
      avatar: files_promised[0]
        ? InternalFile.define<typeof RelationSlots.competition.avatar>(
            files_promised[0].url,
            'competition:avatar',
            'competition:avatar',
          )
        : undefined,
      banner: files_promised[1]
        ? InternalFile.define<typeof RelationSlots.competition.banner>(
            files_promised[1].url,
            'competition:banner',
            'competition:banner',
          )
        : undefined,
      ultraWideBanner: files_promised[3]
        ? InternalFile.define<typeof RelationSlots.competition.ultraWideBanner>(
            files_promised[3].url,
            'competition:ultraWideBanner',
            'competition:ultraWideBanner',
          )
        : undefined,
      socialMedia: files_promised[2]
        ? InternalFile.define<typeof RelationSlots.competition.socialMedia>(
            files_promised[2].url,
            'competition:socialMedia',
            'competition:socialMedia',
          )
        : undefined,
    };

    UserAndCompetitionService.editCompetition(
      competition,
      {
        ...data.competitionData,
        ...files_mapped,
      },
      data.user,
    );

    await this.competitionRepository.save(competition);
  }
}
