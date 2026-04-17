import { Inject } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import { RoundRepository } from 'src/common/infrastructure/repositories/RoundRepository';
import { ReposTokens } from 'src/common/Tokens';
import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';
import { ApiError, RoundErrors } from 'src/error/ApiError';

interface ReadRoundCommandProps {
  id: string;
}

export class ReadRoundCommand extends Command<
  ReadRoundCommandProps,
  RoundEntity
> {
  @Inject(ReposTokens.RoundRepository)
  private readonly roundRepository: RoundRepository;

  async implementation(data: ReadRoundCommandProps): Promise<RoundEntity> {
    const round = await this.roundRepository.findById(data.id);

    if (!round) ApiError.throw(RoundErrors.ROUND_NOT_FOUND);
    if (round.hidden) ApiError.throw(RoundErrors.ROUND_IS_HIDDEN);

    return round;
  }
}
