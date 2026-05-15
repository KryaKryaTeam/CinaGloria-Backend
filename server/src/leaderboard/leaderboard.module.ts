import { Module, Provider } from '@nestjs/common';
import { MapperTokens } from 'src/common/Tokens';
import { LeaderboardMapper } from './appliaction/mapper/LeaderboardMapper';
import { CompetitionsModule } from 'src/competitions/competitions.module';

const providers: Provider[] = [
  { provide: MapperTokens.LeaderboardMapper, useClass: LeaderboardMapper },
];
@Module({
  providers,
  imports: [CompetitionsModule],
  exports: [...providers],
})
export class LeaderboardModule {}
