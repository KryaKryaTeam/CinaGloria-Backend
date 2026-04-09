import { Inject, Injectable } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import { RoundRepository } from 'src/common/infrastructure/repositories/RoundRepository';
import { ReposTokens } from 'src/common/Tokens';
import { ApiError, RoundErrors } from 'src/error/ApiError';
import { Icons } from 'src/types/Icons';

interface PatchRoundCommandProps {
  id: string;
  name?: string;
  description?: string;
  hidden?: boolean;
  startOfRound?: Date;
  endOfRound?: Date;
  icon?: Icons;
}

@Injectable()
export class PatchRoundCommand extends Command<PatchRoundCommandProps, void> {
  @Inject(ReposTokens.RoundRepository)
  private readonly roundRepository: RoundRepository;

  async implementation(data: PatchRoundCommandProps): Promise<void> {
    const round = await this.roundRepository.findById(data.id);

    if (!round) ApiError.throw(RoundErrors.ROUND_NOT_FOUND);

    if (data.name) round.name = data.name;
    if (data.description) round.description = data.description;
    if (data.hidden) round.hidden = data.hidden;
    if (data.startOfRound) round.startOfRound = data.startOfRound;
    if (data.endOfRound) round.endOfRound = data.endOfRound;
    if (data.icon) round.icon = data.icon;

    await this.roundRepository.save(round);
  }
}
