import { forwardRef, Module, Provider } from '@nestjs/common';
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
import { CreateSubmissionCommand } from './application/commands/CreateSubmission.command';
import { UpdateSubmissionCommand } from './application/commands/UpdateSubmission.command';
import { FindSubmissionByIdCommand } from './application/commands/FindSubmissionById.command';
import { Command } from 'nest-commander';
import { DeleteSubmissionCommand } from './application/commands/DeleteSubmission.command';

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
  RoundReviewMapper,
  {
    provide: CommandTokens.CreateSubmissionCommand,
    useClass: CreateSubmissionCommand,
  },
  {
    provide: CommandTokens.UpdateSubmissionCommand,
    useClass: UpdateSubmissionCommand,
  },
  {
    provide: CommandTokens.FindSubmissionByIdCommand,
    useClass: FindSubmissionByIdCommand,
  },
  {
    provide: CommandTokens.DeleteSubmissionCommand,
    useClass: DeleteSubmissionCommand,
  },
];

@Module({
  providers,
  imports: [forwardRef(() => CompetitionsModule)],
  exports: [...providers],
  controllers: [SubmissionController, ScoreController, RoundReviewController],
})
export class JudgingModule {}
