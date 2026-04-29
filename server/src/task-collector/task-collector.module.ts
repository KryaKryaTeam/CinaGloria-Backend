import { Module, Provider } from '@nestjs/common';
import { MapperTokens } from 'src/common/Tokens';
import { CriteriaMapper } from './application/mappers/CriteriaMapper';
import { SubmitionMapper } from './application/mappers/SubmitionMapper';

const providers: Provider[] = [
  { provide: MapperTokens.CriteriaMapper, useClass: CriteriaMapper },
  { provide: MapperTokens.SubmitionMapper, useClass: SubmitionMapper },
];

@Module({
  providers,
  exports: [...providers],
})
export class TaskCollectorModule {}
