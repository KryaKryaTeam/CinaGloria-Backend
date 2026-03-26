import { forwardRef, Module, Provider } from '@nestjs/common';
import { CommandTokens, MapperTokens } from 'src/common/Tokens';
import { CompetitionMapper } from './application/mapper/Competition.mapper';
import { CreateCompetitionCommand } from './application/commands/CreateCompetition.command';
import { DeclineScheduledPublishCommand } from './application/commands/DeclineScheduleOfPublishingOfCompetition.command';
import { GetPublicCompetitionsPageQuery } from './application/commands/GetPageOfPublicCompetitions.command';
import { GetCompetitionPageQuery } from './application/commands/GetPageOfCompetition.command';
import { GetPublicCompetitionQuery } from './application/commands/GetPublicCompetition.command';
import { PublishCompetitionCommand } from './application/commands/PublishCompetition.command';
import { ScheduleCompetitionPublishCommand } from './application/commands/SchedulePublishingOfCompetition.command';
import { UpdateCompetitionCommand } from './application/commands/UpdateCompetition.command';
import { FilesModule } from 'src/files/files.module';

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
];

@Module({
  providers,
  exports: [...providers],
  imports: [forwardRef(() => FilesModule)],
})
export class CompetitionsModule {}
