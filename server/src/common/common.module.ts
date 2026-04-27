import { forwardRef, Global, Module, Provider } from '@nestjs/common';
import { BaseTokens, ReposTokens } from './Tokens';
import { EventDispatcher } from './application/events/EventDispatcher';
import { EventHandler } from './application/events/EventHandler';
import { DBContext } from './infrastructure/DBContext';
import { UserRepository } from './infrastructure/repositories/UserRepository';
import { AuthorizationProviderRepository } from './infrastructure/repositories/AuthorizationProviderRepository';
import { AuthorizationModule } from 'src/authorization/authorization.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSchema } from 'src/schemas/User.schema';
import { AuthorizationProvider } from 'src/schemas/AuthorizationProvider.schema';
import { NotificationRepository } from './infrastructure/repositories/NotificationRepository';
import { NotificationModule } from 'src/notification/notification.module';
import { FileRepository } from './infrastructure/repositories/FileRepository';
import { FileRelationRepository } from './infrastructure/repositories/FileRelationRepository';
import { FilesModule } from 'src/files/files.module';
import { Notification } from 'src/notification/domain/entities/Notification';
import { FileSchema } from 'src/schemas/File.schema';
import { FileRelation } from 'src/schemas/FileRelation.schema';
import { CompetitionsModule } from 'src/competitions/competitions.module';
import { CompetitionSchema } from 'src/schemas/Competition.schema';
import { CompetitionRepository } from './infrastructure/repositories/CompetitionRepository';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JsonInterceptor } from './infrastructure/interceptors/JsonInterceptor';
import { RoundRepository } from './infrastructure/repositories/RoundRepository';
import { TeamsModule } from 'src/teams/teams.module';
import { TeamSchema } from 'src/schemas/Team.schema';
import { RoundSchema } from 'src/schemas/Round.schema';
import { TaskSchema } from 'src/schemas/Task.schema';
import { TeamRepository } from './infrastructure/repositories/TeamRepository';
import { TaskRepository } from './infrastructure/repositories/TaskRepository';

const providers: Provider[] = [
  { provide: BaseTokens.EventDispatcher, useClass: EventDispatcher },
  { provide: BaseTokens.EventHandler, useClass: EventHandler },
  { provide: BaseTokens.DBContext, useClass: DBContext },
  { provide: ReposTokens.UserRepository, useClass: UserRepository },
  {
    provide: ReposTokens.AuthorizationProviderRepository,
    useClass: AuthorizationProviderRepository,
  },
  {
    provide: ReposTokens.NotificationRepository,
    useClass: NotificationRepository,
  },
  { provide: ReposTokens.FileRepository, useClass: FileRepository },
  {
    provide: ReposTokens.FileRelationRepository,
    useClass: FileRelationRepository,
  },
  {
    provide: ReposTokens.CompetitionRepository,
    useClass: CompetitionRepository,
  },
  {
    provide: ReposTokens.RoundRepository,
    useClass: RoundRepository,
  },
  { provide: ReposTokens.TeamRepository, useClass: TeamRepository },
  { provide: ReposTokens.TaskRepository, useClass: TaskRepository },
];

@Global()
@Module({
  providers: [
    ...providers,
    {
      provide: APP_INTERCEPTOR,
      useClass: JsonInterceptor,
    },
  ],
  exports: providers,
  imports: [
    TypeOrmModule.forFeature([
      UserSchema,
      AuthorizationProvider,
      Notification,
      FileSchema,
      FileRelation,
      CompetitionSchema,
      TeamSchema,
      RoundSchema,
      TaskSchema,
    ]),
    forwardRef(() => AuthorizationModule),
    forwardRef(() => NotificationModule),
    forwardRef(() => FilesModule),
    forwardRef(() => CompetitionsModule),
    forwardRef(() => TeamsModule),
  ],
})
export class CommonModule {}
