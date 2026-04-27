import { Inject } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import { ReposTokens } from 'src/common/Tokens';
import type { IRoundRepository } from '../bounds/RoundRepository';
import { RoundStarted } from 'src/competitions/domain/events/RoundStarted.event';
import { RoundStatus } from 'src/types/RoundStatus';

export class RunStartEventOnAllStartedRoundsCommand extends Command<
  void,
  void
> {
  @Inject(ReposTokens.RoundRepository)
  private readonly roundRepository: IRoundRepository;

  async implementation(): Promise<void> {
    const rounds = await this.roundRepository.findAllStartedButNotProcessed();

    await Promise.all(
      rounds.map(async (el) => {
        el.status = RoundStatus.IN_PROGRESS;

        this.eventDispatcher.addEvent(new RoundStarted(el));

        await this.roundRepository.save(el);
      }),
    );
  }
}
