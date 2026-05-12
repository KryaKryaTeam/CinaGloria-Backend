import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CommandTokens } from 'src/common/Tokens';
import { HandleCompetitionScheduledEventsCommand } from 'src/competitions/application/commands/HandleCompetitionScheduledEvents.command';
import { PullTeamsToNextRoundCommand } from 'src/competitions/application/commands/PullTeamsToNextRound.command';
import { RunEndEventOnAllEndedRoundsCommand } from 'src/competitions/application/commands/RunEndEventOnAllEndedRounds.command';
import { RunStartEventOnAllStartedRoundsCommand } from 'src/competitions/application/commands/RunStartEventOnAllStartedRounds.command';

@Injectable()
export class RoundsStartAndEndSearchCronService {
  constructor(private readonly schedulerRegistry: SchedulerRegistry) {}

  private readonly logger = new Logger('Cron job');

  @Inject(CommandTokens.RunEndEventOnAllEndedRoundsCommand)
  private readonly runEndEventOnAllEndedRoundsCommand: RunEndEventOnAllEndedRoundsCommand;

  @Inject(CommandTokens.RunStartedEventOnAllStartedRoundsCommand)
  private readonly runStartedEventOnAllStartedRoundsCommand: RunStartEventOnAllStartedRoundsCommand;

  @Inject(CommandTokens.HandleCompetitionScheduledEventsCommand as string)
  private readonly handleCompetitionScheduledEventsCommand: HandleCompetitionScheduledEventsCommand;

  @Inject(CommandTokens.PullTeamsToNextRound)
  private readonly pullTeamsToNextRoundCommand: PullTeamsToNextRoundCommand;

  @Cron(CronExpression.EVERY_MINUTE, { waitForCompletion: true })
  async handleRoundsLifecycle() {
    this.logger.log('🚀 Starting rounds lifecycle sync...');
    const startTime = Date.now();

    try {
      await this.pullTeamsToNextRoundCommand.execute();
      await this.runEndEventOnAllEndedRoundsCommand.execute();
      await this.runStartedEventOnAllStartedRoundsCommand.execute();
      await this.handleCompetitionScheduledEventsCommand.execute();

      this.logger.log(
        `✅ Lifecycle sync finished in ${Date.now() - startTime}ms`,
      );
    } catch (error) {
      this.logger.error('❌ Error during lifecycle cron:', error);
    }
  }
}
