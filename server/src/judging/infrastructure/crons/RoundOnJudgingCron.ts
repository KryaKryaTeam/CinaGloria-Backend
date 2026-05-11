import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CommandTokens } from 'src/common/Tokens';
import { RoundOnJudgingCommand } from 'src/judging/application/commands/RoundOnJudging.command';

@Injectable()
export class CheckTimedOutRounds {
  private readonly logger = new Logger('Cron job');

  @Inject(CommandTokens.RoundOnJudgingCommand)
  private readonly roundOnJudgingCommand: RoundOnJudgingCommand;

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCheckTimedOutRounds() {
    const action =
      "distributing juries and changing rounds' statuses to ON_JUDGING";
    this.logger.log(`Started ${action}`);
    const startTime = Date.now();

    try {
      await this.roundOnJudgingCommand.execute();
      this.logger.log(`Finished ${action} in ${Date.now() - startTime}ms`);
    } catch (error) {
      this.logger.error(`Error while ${action}: `, error);
    }
  }
}
