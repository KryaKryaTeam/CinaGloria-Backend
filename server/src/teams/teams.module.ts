import { Module, Provider } from '@nestjs/common';
import { MapperTokens } from 'src/common/Tokens';
import { TeamMapper } from 'src/teams/application/mappers/team.mapper';

const providers: Provider[] = [
  {
    provide: MapperTokens.TeamMapper,
    useClass: TeamMapper,
  },
];

@Module({
  providers,
  exports: [...providers],
})
export class TeamsModule {}
