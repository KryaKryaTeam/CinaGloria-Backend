import { Module, Provider } from '@nestjs/common';
import { CommandTokens, MapperTokens } from 'src/common/Tokens';
import { LeaderboardMapper } from './appliaction/mapper/LeaderboardMapper';
import { CompetitionsModule } from 'src/competitions/competitions.module';
import { GenerateLeaderboardCommand } from './appliaction/commands/GenerateLeaderboard.command';
import { GetLeaderboardCommand } from './appliaction/commands/GetLeaderboard.command';
import { LederboardController } from './infrustructure/controllers/leaderboard.controller';

const providers: Provider[] = [
  { provide: MapperTokens.LeaderboardMapper, useClass: LeaderboardMapper },
  {
    provide: CommandTokens.GenerateLeaderboardCommand,
    useClass: GenerateLeaderboardCommand,
  },
  {
    provide: CommandTokens.GetLeaderboardCommand,
    useClass: GetLeaderboardCommand,
  },
];
@Module({
  providers,
  imports: [CompetitionsModule],
  exports: [...providers],
  controllers: [LederboardController],
})
export class LeaderboardModule {}
