import { forwardRef, Module, Provider } from '@nestjs/common';
import { CommandTokens, MapperTokens, ServiceTokens } from 'src/common/Tokens';
import { NotificationService } from './infrastructure/service/NotificationService';
import { WSTarget } from './infrastructure/targets/WSTarget';
import { DiscoveryModule, DiscoveryService } from '@nestjs/core';
import { NotificationSendEventHandler } from './infrastructure/handlers/NotificationSendEventHandler';
import { NotificationMapper } from './application/mappers/NotificationMapper';
import { AuthorizationModule } from 'src/authorization/authorization.module';
import { JwtModule } from '@nestjs/jwt';
import { TicketService } from './infrastructure/service/TicketService';
import { WSController } from './infrastructure/controllers/WebsocketContorller';
import { GenerateTicketCommand } from './application/commands/GenerateTicketCommand';
import { NotificationGateway } from './infrastructure/gateways/WsNotification.gateway';
import { EmailNotificationTarget } from './infrastructure/targets/EmailTarget';
import { CacheModule } from '@nestjs/cache-manager';
import { GetNotificationsQuery } from './application/commands/GetNotificationsQuery';
import { NotificationsController } from './infrastructure/controllers/NotificationsController';
import { MakeNotificationReaded } from './application/commands/MakeNotificationReadedCommand';

const providers: Provider[] = [
  DiscoveryService,
  {
    provide: ServiceTokens.NotificationService,
    useClass: NotificationService,
  },
  {
    provide: MapperTokens.NotificationMapper,
    useClass: NotificationMapper,
  },
  {
    provide: ServiceTokens.WsTicketService,
    useClass: TicketService,
  },
  {
    provide: CommandTokens.GenerateTicketCommand,
    useClass: GenerateTicketCommand,
  },
  {
    provide: CommandTokens.GetNotificationsQuery,
    useClass: GetNotificationsQuery,
  },
  {
    provide: CommandTokens.MakeNotificationReaded,
    useClass: MakeNotificationReaded,
  },
  EmailNotificationTarget,
  NotificationSendEventHandler,
  WSTarget,
  NotificationGateway,
];

@Module({
  providers,
  imports: [
    DiscoveryModule,
    forwardRef(() => AuthorizationModule),
    JwtModule.register({}),
    CacheModule.register({ ttl: 3600 * 6 }),
  ],
  exports: [...providers],
  controllers: [WSController, NotificationsController],
})
export class NotificationModule {}
