import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { CommandTokens } from 'src/common/Tokens';
import { RunEndEventOnAllEndedRoundsCommand } from 'src/competitions/application/commands/RunEndEventOnAllEndedRounds.command';

@Injectable()
export class RoundsStartAndEndSearchCronService {
  constructor(private readonly schedulerRegistry: SchedulerRegistry) {}

  private readonly logger = new Logger('Cron job');

  @Inject(CommandTokens.RunEndEventOnAllEndedRoundsCommand)
  private readonly runEndEventOnAllEndedRoundsCommand: RunEndEventOnAllEndedRoundsCommand;

  @Cron('0 * * * * *')
  async handleCron() {
    const date = Date.now();
    this.logger.log('Start handling ended rounds');
    await this.runEndEventOnAllEndedRoundsCommand.execute();

    this.logger.log(
      `All ended rounds were handled, time: ${Date.now() - date}ms`,
    );
  }
}
