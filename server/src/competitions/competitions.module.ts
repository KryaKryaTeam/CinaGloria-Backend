import { forwardRef, Module, Provider } from '@nestjs/common';
import { CommandTokens, MapperTokens } from 'src/common/Tokens';
import { CompetitionMapper } from './application/mapper/Competition.mapper';
import { CreateCompetitionCommand } from './application/commands/CreateCompetition.command';
import { DeclineScheduledPublishCommand } from './application/commands/DeclineScheduleOfPublishingOfCompetition.command';
import { GetPublicCompetitionsPageQuery } from './application/commands/GetPageOfPublicCompetitions.command';
import { GetCompetitionPageQuery } from './application/commands/GetPageOfCompetition.command';
import { GetPublicCompetitionQuery } from './application/commands/GetPublicCompetition.query';
import { PublishCompetitionCommand } from './application/commands/PublishCompetition.command';
import { ScheduleCompetitionPublishCommand } from './application/commands/SchedulePublishingOfCompetition.command';
import { UpdateCompetitionCommand } from './application/commands/UpdateCompetition.command';
import { FilesModule } from 'src/files/files.module';
import { CompetitionController } from './infrastructure/controllers/competition.controller';
import { DeleteCompetitionCommand } from './application/commands/DeleteCompetition';
import { RoundController } from './infrastructure/controllers/round.controller';
import { TaskController } from './infrastructure/controllers/task.controller';
import { RoundMapper } from './application/mapper/Round.mapper';
import { TaskMapper } from './application/mapper/Task.mapper';
import { UpdateSettingsOfCompetitionCommand } from './application/commands/UpdateSettingsOfCompetition.command';
import { CreateRoundCommand } from './application/commands/CreateRound.command';
import { DeleteRoundCommand } from './application/commands/DeleteRound.command';
import { PatchRoundCommand } from './application/commands/PatchRound.command';
import { CreateTaskCommand } from './application/commands/CreateTask.command';
import { TeamsModule } from 'src/teams/teams.module';
import { PullTeamsToNextRoundCommand } from './application/commands/PullTeamsToNextRound.command';
import { LeaderboardModule } from 'src/leaderboard/leaderboard.module';
import { JudgingModule } from 'src/judging/judging.module';
import { DeleteTaskCommand } from './application/commands/DeleteTask.command';
import { GetPrivateCompetitionByIdCommand } from './application/commands/GetPrivateCompetitionById.command';

const providers: Provider[] = [
  {
    provide: MapperTokens.CompetitionMapper,
    useClass: CompetitionMapper,
  },
  {
    provide: CommandTokens.CreateCompetitionCommand,
    useClass: CreateCompetitionCommand,
  },
  {
    provide: CommandTokens.DeclineScheduledPublishCommand,
    useClass: DeclineScheduledPublishCommand,
  },
  {
    provide: CommandTokens.GetPublicCompetitionsPageQuery,
    useClass: GetPublicCompetitionsPageQuery,
  },
  {
    provide: CommandTokens.GetCompetitionPageQuery,
    useClass: GetCompetitionPageQuery,
  },
  {
    provide: CommandTokens.GetPublicCompetitionQuery,
    useClass: GetPublicCompetitionQuery,
  },
  {
    provide: CommandTokens.PublishCompetitionCommand,
    useClass: PublishCompetitionCommand,
  },
  {
    provide: CommandTokens.ScheduleCompetitionPublishCommand,
    useClass: ScheduleCompetitionPublishCommand,
  },
  {
    provide: CommandTokens.UpdateCompetitionCommand,
    useClass: UpdateCompetitionCommand,
  },
  {
    provide: CommandTokens.DeleteCompetitionCommand,
    useClass: DeleteCompetitionCommand,
  },
  {
    provide: MapperTokens.RoundMapper,
    useClass: RoundMapper,
  },
  {
    provide: MapperTokens.TaskMapper,
    useClass: TaskMapper,
  },
  {
    provide: CommandTokens.UpdateSettingsOfCompetitionCommand,
    useClass: UpdateSettingsOfCompetitionCommand,
  },
  { provide: CommandTokens.CreateRoundCommand, useClass: CreateRoundCommand },
  { provide: CommandTokens.DeleteRoundCommand, useClass: DeleteRoundCommand },
  { provide: CommandTokens.PatchRoundCommand, useClass: PatchRoundCommand },
  { provide: CommandTokens.CreateTaskCommand, useClass: CreateTaskCommand },
  { provide: CommandTokens.DeleteTaskCommand, useClass: DeleteTaskCommand },
  {
    provide: CommandTokens.GetPrivateCompetitionByIdCommand,
    useClass: GetPrivateCompetitionByIdCommand,
  },
];

@Module({
  providers,
  exports: [...providers],
  imports: [forwardRef(() => FilesModule), forwardRef(() => TeamsModule)],
  controllers: [CompetitionController, RoundController, TaskController],
})
export class CompetitionsModule {}
