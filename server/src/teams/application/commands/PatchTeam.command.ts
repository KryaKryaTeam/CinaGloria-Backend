import { Inject } from '@nestjs/common';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Command } from 'src/common/application/Command';
import { ReposTokens, ServiceTokens } from 'src/common/Tokens';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import type { ITeamRepository } from '../bounds/TeamRepository';
import { ApiError, DomainErrors, TeamErrors } from 'src/error/ApiError';
import { TeamEntityHelperService } from 'src/teams/domain/services/TeamEntityHelper.service';
import { LinkerApplicationService } from 'src/files/application/services/Linker.appService';
import type { IFileRepository } from 'src/files/application/bounds/IFileRepository';
import { RelationString } from 'src/files/domain/objects/RelationSlots';

interface PatchTeamCommandInput {
  user: UserEntity;
  teamId: string;
  teamData: {
    name?: string;
    avatar?: string;
    banner?: string;
  };
}

export class PatchTeamCommand extends Command<PatchTeamCommandInput, void> {
  @Inject(ReposTokens.TeamRepository) teamRepo: ITeamRepository;
  @Inject(ServiceTokens.FileLinkerService)
  fileLinkerService: LinkerApplicationService;
  @Inject(ReposTokens.FileRepository)
  private readonly fileRepository: IFileRepository;
  async implementation(data: PatchTeamCommandInput): Promise<void> {
    const team = await this.teamRepo.findById(data.teamId);
    if (!team) ApiError.throw(TeamErrors.TEAM_UNDEFINED);
    let avatarFile, bannerFile;
    if (data.teamData.avatar && team.isCaptain(data.user.id)) {
      avatarFile = await this.fileRepository.findByUrl(data.teamData.avatar);

      if (!avatarFile) ApiError.throw(DomainErrors.UNEXPECTED_VALUE);

      await this.fileLinkerService.linkFileToTeamSlot(
        avatarFile,
        team,
        RelationString.define('team:avatar'),
      );
    }

    if (data.teamData.banner && team.isCaptain(data.user.id)) {
      bannerFile = await this.fileRepository.findByUrl(data.teamData.banner);

      if (!bannerFile) ApiError.throw(DomainErrors.UNEXPECTED_VALUE);

      await this.fileLinkerService.linkFileToTeamSlot(
        bannerFile,
        team,
        RelationString.define('team:banner'),
      );
    }

    TeamEntityHelperService.patchEntity(
      team,
      {
        name: data.teamData.name,
        avatar: avatarFile
          ? InternalFile.fromFileEntity<'team:avatar'>(
              avatarFile,
              'team:avatar',
            )
          : undefined,
        banner: bannerFile
          ? InternalFile.fromFileEntity<'team:banner'>(
              bannerFile,
              'team:banner',
            )
          : undefined,
      },
      data.user,
    );

    team.pullEvents(this.eventDispatcher);

    await this.teamRepo.save(team);
  }
}
// to merge
