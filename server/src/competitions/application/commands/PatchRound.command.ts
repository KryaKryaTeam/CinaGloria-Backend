import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Command } from 'src/common/application/Command';
import { RoundRepository } from 'src/common/infrastructure/repositories/RoundRepository';
import { ReposTokens } from 'src/common/Tokens';
import { ApiError, RoundErrors, UserErrors } from 'src/error/ApiError';
import { Icons } from 'src/types/Icons';
import { RoleEnum } from 'src/types/RoleEnum';

interface PatchRoundCommandProps {
  user: UserEntity;
  roundId: string;
  name?: string;
  description?: string;
  startOfRound?: Date;
  taskTimeout?: Date;
  endOfRound?: Date;
  icon?: Icons;
}

@Injectable()
export class PatchRoundCommand extends Command<PatchRoundCommandProps, void> {
  @Inject(ReposTokens.RoundRepository)
  private readonly roundRepository: RoundRepository;

  async implementation(data: PatchRoundCommandProps): Promise<void> {
    if (
      !(
        data.user.hasRole(RoleEnum.ADMIN) ||
        data.user.hasRole(RoleEnum.ORGANIZER)
      )
    )
      ApiError.throw(UserErrors.NOT_ENOUGH_RIGHTS);

    const round = await this.roundRepository.findById(data.roundId);

    if (!round) ApiError.throw(RoundErrors.ROUND_NOT_FOUND);

    if (data.name) round.name = data.name;
    if (data.description) round.description = data.description;
    if (data.startOfRound) round.startOfRound = data.startOfRound;
    if (data.taskTimeout) round.taskTimeout = data.taskTimeout;
    if (data.endOfRound) round.endOfRound = data.endOfRound;
    if (data.icon) round.icon = data.icon;

    await this.roundRepository.save(round);
  }
}
