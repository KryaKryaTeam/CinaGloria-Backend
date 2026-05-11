import { Inject } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import { ReposTokens } from 'src/common/Tokens';
import type { ICompetitionRepository } from '../bounds/CompetitionRepository';
import { CompetitionEntity } from 'src/competitions/domain/entities/Competition.entity';

export class HandleCompetitionScheduledEventsCommand extends Command<
  void,
  void
> {
  @Inject(ReposTokens.CompetitionRepository)
  private readonly competitionRepository: ICompetitionRepository;
  async implementation(): Promise<void> {
    const Steps: {
      fetch: () => Promise<CompetitionEntity[]>;
      action: (comp: CompetitionEntity) => void;
    }[] = [
      {
        fetch: () => this.competitionRepository.findAllScheduledNotProcessed(),
        action: (comp) => comp.publish(),
      },
      {
        fetch: () =>
          this.competitionRepository.findAllRegistrationStartedNotProcessed(),
        action: (comp) => comp.startRegistration(),
      },
      {
        fetch: () =>
          this.competitionRepository.findAllRegistrationEndedNotProcessed(),
        action: (comp) => comp.endRegistration(),
      },
      {
        fetch: () => this.competitionRepository.findAllStartedNotProcessed(),
        action: (comp) => comp.start(),
      },
      {
        fetch: () => this.competitionRepository.findAllEndedNotProcessed(),
        action: (comp) => comp.end(),
      },
    ];
    for (const step of Steps) {
      const competitions = await step.fetch();

      if (competitions.length === 0) continue;

      await Promise.all(
        competitions.map(async (comp) => {
          step.action(comp);
          comp.pullEvents(this.eventDispatcher);
          await this.competitionRepository.save(comp);
        }),
      );
    }
  }
}
