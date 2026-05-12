import { Inject } from '@nestjs/common';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Command } from 'src/common/application/Command';
import { ReposTokens, ServiceTokens } from 'src/common/Tokens';
import { ICreateCompetitionRAW } from 'src/competitions/domain/entities/Competition.entity';
import type { ICompetitionRepository } from '../bounds/CompetitionRepository';
import { UserAndCompetitionService } from 'src/competitions/domain/services/UserAndCompetitionService';
import { RelationString } from 'src/files/domain/objects/RelationSlots';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { AppSlotCode } from 'src/types/RelationSlots';
import { LinkerApplicationService } from 'src/files/application/services/Linker.appService';
import type { IFileRepository } from 'src/files/application/bounds/IFileRepository';
import { ApiError, CompetitionErrors } from 'src/error/ApiError';
import { CompetitionRule } from 'src/competitions/domain/objects/CompetitionRule.object';
import { Icons } from 'src/types/Icons';

interface UpdateCompetitionCommandInput {
  competitionId: string;
  user: UserEntity;
  competitionData: ICreateCompetitionRAW;
}

const COMPETITION_FILE_SLOTS = {
  avatar: 'competition:avatar',
  banner: 'competition:banner',
  socialMedia: 'competition:socialMedia',
  ultraWideBanner: 'competition:ultraWideBanner',
} as const;

type FileKeys = keyof typeof COMPETITION_FILE_SLOTS;

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

    const fileEntries = await Promise.all(
      Object.entries(COMPETITION_FILE_SLOTS).map(async ([key, slotName]) => {
        const url = data.competitionData[key as FileKeys];
        if (!url) return [key, undefined];

        const file = await this.fileRepository.findByUrl(url);
        if (!file) return [key, undefined];

        await this.linkerService.linkFileToCompetitionSlot(
          file,
          competition,
          RelationString.define(slotName),
        );

        const internalFile = InternalFile.define(
          file.url,
          slotName as AppSlotCode,
          slotName as AppSlotCode,
        );

        return [slotName, internalFile];
      }),
    );

    const mappedFiles = Object.fromEntries(fileEntries) as Record<
      AppSlotCode,
      InternalFile<AppSlotCode>
    >;

    UserAndCompetitionService.editCompetition(
      competition,
      {
        ...data.competitionData,
        ultraWideBanner: mappedFiles['competition:ultraWideBanner'] as
          | InternalFile<'competition:ultraWideBanner'>
          | undefined,
        avatar: mappedFiles['competition:avatar'] as
          | InternalFile<'competition:avatar'>
          | undefined,
        banner: mappedFiles['competition:banner'] as
          | InternalFile<'competition:banner'>
          | undefined,
        socialMedia: mappedFiles['competition:socialMedia'] as
          | InternalFile<'competition:socialMedia'>
          | undefined,
        rules: data.competitionData.rules
          ? data.competitionData.rules.map((el) =>
              CompetitionRule.define(
                el.name,
                el.description,
                el.icon as unknown as Icons,
              ),
            )
          : undefined,
      },
      data.user,
    );

    await this.competitionRepository.save(competition);
  }
}
