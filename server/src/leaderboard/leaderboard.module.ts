import { Module, Provider } from '@nestjs/common';
import { CommandTokens, MapperTokens } from 'src/common/Tokens';
import { LeaderboardMapper } from './appliaction/mapper/LeaderboardMapper';
import { CompetitionsModule } from 'src/competitions/competitions.module';
import { GenerateLeaderboardCommand } from './appliaction/commands/GenerateLeaderboard.command';

const providers: Provider[] = [
  { provide: MapperTokens.LeaderboardMapper, useClass: LeaderboardMapper },
  {
    provide: CommandTokens.GenerateLeaderboardCommand,
    useClass: GenerateLeaderboardCommand,
  },
];
@Module({
  providers,
  imports: [CompetitionsModule],
  exports: [...providers],
})
export class LeaderboardModule {}
