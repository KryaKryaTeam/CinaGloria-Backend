import { Module, Provider } from '@nestjs/common';
import { CommandTokens, MapperTokens } from 'src/common/Tokens';
import { CriteriaMapper } from './application/mappers/CriteriaMapper';
import { SubmitionMapper } from './application/mappers/SubmitionMapper';
import { CompetitionsModule } from 'src/competitions/competitions.module';
import { ScoreMapper } from './application/mappers/ScoreMapper';
import { SubmissionController } from './infrastructure/controllers/submission.controller';
import { CreateScoreCommand } from './application/commands/CreateScore.command';
import { RoundReviewMapper } from './application/mappers/RoundReviewMapper';
import { ScoreController } from './infrastructure/controllers/score.controller';
import { RoundReviewController } from './infrastructure/controllers/roundReview.controller';
import { CreateRoundReviewCommand } from './application/commands/CreateRoundReview.command';

const providers: Provider[] = [
  { provide: MapperTokens.CriteriaMapper, useClass: CriteriaMapper },
  { provide: MapperTokens.ScoreMapper, useClass: ScoreMapper },
  { provide: MapperTokens.SubmitionMapper, useClass: SubmitionMapper },
  { provide: CommandTokens.CreateScoreCommand, useClass: CreateScoreCommand },
  { provide: MapperTokens.RoundReviewMapper, useClass: RoundReviewMapper },
  {
    provide: CommandTokens.CreateRoundReviewCommand,
    useClass: CreateRoundReviewCommand,
  },
];

@Module({
  providers,
  imports: [CompetitionsModule],
  exports: [...providers],
  controllers: [SubmissionController, ScoreController, RoundReviewController],
})
export class JudgingModule {}
