import { Module, Provider } from '@nestjs/common';
import { MapperTokens } from 'src/common/Tokens';
import { CriteriaMapper } from './application/mappers/CriteriaMapper';
import { SubmitionMapper } from './application/mappers/SubmitionMapper';
import { CompetitionsModule } from 'src/competitions/competitions.module';
import { ScoreMapper } from './application/mappers/ScoreMapper';
import { SubmissionController } from './infrastructure/controllers/submission.controller';

const providers: Provider[] = [
  { provide: MapperTokens.CriteriaMapper, useClass: CriteriaMapper },
  { provide: MapperTokens.ScoreMapper, useClass: ScoreMapper },
  { provide: MapperTokens.SubmitionMapper, useClass: SubmitionMapper },
];

@Module({
  providers,
  imports: [CompetitionsModule],
  exports: [...providers],
  controllers: [SubmissionController],
})
export class JudgingModule {}
