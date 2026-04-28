import { Module, Provider } from '@nestjs/common';
import { MapperTokens } from 'src/common/Tokens';
import { CriteriaMapper } from './application/mappers/CriteriaMapper';

const providers: Provider[] = [
  { provide: MapperTokens.CriteriaMapper, useClass: CriteriaMapper },
];

@Module({
  providers,
  exports: [...providers],
})
export class TaskCollectorModule {}
