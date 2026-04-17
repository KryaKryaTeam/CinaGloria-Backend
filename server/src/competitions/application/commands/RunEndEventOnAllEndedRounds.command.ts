import { Inject } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import { ReposTokens } from 'src/common/Tokens';
import type { IRoundRepository } from '../bounds/RoundRepository';
import type { ICompetitionRepository } from '../bounds/CompetitionRepository';
import { RoundEnded } from 'src/competitions/domain/events/RoundEnded.event';

export class RunEndEventOnAllEndedRoundsCommand extends Command<void, void> {
  @Inject(ReposTokens.RoundRepository)
  private readonly roundRepo: IRoundRepository;

  @Inject(ReposTokens.CompetitionRepository)
  private readonly competitionRepo: ICompetitionRepository;

  async implementation(): Promise<void> {
    const rounds = await this.roundRepo.findAllEndedButNotProcessed();

    await Promise.all(
      rounds.map(async (el) => {
        this.eventDispatcher.addEvent(new RoundEnded(el));

        const competitionId = await this.roundRepo.getParentCompetitionId(el);
        if (!competitionId) return;
        const competition = await this.competitionRepo.findById(competitionId);
        if (!competition) return;

        competition.showNextRound();
      }),
    );
  }
}
