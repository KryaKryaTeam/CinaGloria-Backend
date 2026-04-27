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
import { UpdateSettingsOfCompetitionCommand } from './application/commands/UpdateSettingsOfCompetition.command';
import { RunEndEventOnAllEndedRoundsCommand } from './application/commands/RunEndEventOnAllEndedRounds.command';
import { RoundsStartAndEndSearchCronService } from './infrastructure/cronJobs/RoundsStartAndEndSearch.cron';
import { RoundMapper } from './application/mapper/Round.mapper';
import { TaskMapper } from './application/mapper/Task.mapper';
import { RunStartEventOnAllStartedRoundsCommand } from './application/commands/RunStartEventOnAllStartedRounds.command';
import { HandleCompetitionScheduledEventsCommand } from './application/commands/HandleCompetitionScheduledEvents.command';

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
    provide: CommandTokens.UpdateSettingsOfCompetitionCommand,
    useClass: UpdateSettingsOfCompetitionCommand,
  },
  {
    provide: CommandTokens.RunEndEventOnAllEndedRoundsCommand,
    useClass: RunEndEventOnAllEndedRoundsCommand,
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
    provide: CommandTokens.RunStartedEventOnAllStartedRoundsCommand,
    useClass: RunStartEventOnAllStartedRoundsCommand,
  },
  {
    provide: CommandTokens.HandleCompetitionScheduledEventsCommand as string,
    useClass: HandleCompetitionScheduledEventsCommand,
  },
  RoundsStartAndEndSearchCronService,
];

@Module({
  providers,
  exports: [...providers],
  imports: [forwardRef(() => FilesModule)],
  controllers: [CompetitionController],
})
export class CompetitionsModule {}
