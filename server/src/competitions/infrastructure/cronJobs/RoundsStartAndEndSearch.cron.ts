import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { CommandTokens } from 'src/common/Tokens';
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

  @Cron('0 * * * * *')
  async handleCronEnd() {
    const date = Date.now();
    this.logger.log('Start handling ended rounds');

    await this.runEndEventOnAllEndedRoundsCommand.execute();

    this.logger.log(
      `All ended rounds were handled, time: ${Date.now() - date}ms`,
    );
  }

  @Cron('0 * * * * *')
  async handleCronStart() {
    const date = Date.now();
    this.logger.log('Start handling started rounds');

    await this.runStartedEventOnAllStartedRoundsCommand.execute();

    this.logger.log(
      `All started round are handled, time: ${Date.now() - date}ms`,
    );
  }
}
