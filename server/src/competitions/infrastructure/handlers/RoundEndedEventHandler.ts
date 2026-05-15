import { Inject, Injectable } from '@nestjs/common';
import { EventType } from 'src/common/domain/EventType';
import { BaseHandler } from 'src/common/infrastructure/BaseHandler';
import { CommandTokens } from 'src/common/Tokens';
import { PullTeamsToNextRoundCommand } from 'src/competitions/application/commands/PullTeamsToNextRound.command';
import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';
import { GenerateLeaderboardCommand } from 'src/leaderboard/appliaction/commands/GenerateLeaderboard.command';

@Injectable()
export class RoundEndedEventHandler extends BaseHandler {
  protected eventType: EventType.ROUND_ENDED;

  @Inject(CommandTokens.PullTeamsToNextRound)
  private readonly pullTeamsToNextRoundCommand: PullTeamsToNextRoundCommand;

  @Inject(CommandTokens.GenerateLeaderboardCommand)
  private readonly generateLeaderboardCommand: GenerateLeaderboardCommand;

  async implementation(round: RoundEntity, ...data: unknown[]): Promise<void> {
    const leaderboard = await this.generateLeaderboardCommand.execute(round);
    await this.pullTeamsToNextRoundCommand.execute(leaderboard);
  }
}
