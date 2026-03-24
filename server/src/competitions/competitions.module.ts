import { Module, Provider } from '@nestjs/common';
import { MapperTokens } from 'src/common/Tokens';
import { CompetitionMapper } from './application/mapper/Competition.mapper';

const providers: Provider[] = [
  {
    provide: MapperTokens.CompetitionMapper,
    useClass: CompetitionMapper,
  },
];

@Module({
  providers,
  exports: [...providers],
})
export class CompetitionsModule {}
