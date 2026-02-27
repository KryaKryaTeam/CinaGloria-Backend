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
import { WSContorller } from './infrastructure/controllers/WebsocketContorller';
import { GenerateTicketCommand } from './application/commands/GenerateTicketCommand';

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
  NotificationSendEventHandler,
  WSTarget,
];

@Module({
  providers,
  imports: [
    DiscoveryModule,
    forwardRef(() => AuthorizationModule),
    JwtModule.register({}),
  ],
  exports: [...providers],
  controllers: [WSContorller],
})
export class NotificationModule {}
