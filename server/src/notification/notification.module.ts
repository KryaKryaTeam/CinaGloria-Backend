import { forwardRef, Module, Provider } from '@nestjs/common';
import { MapperTokens, ServiceTokens } from 'src/common/Tokens';
import { NotificationService } from './infrastructure/service/NotificationService';
import { WSTarget } from './infrastructure/targets/WSTarget';
import { DiscoveryModule, DiscoveryService } from '@nestjs/core';
import { NotificationSendEventHandler } from './infrastructure/handlers/NotificationSendEventHandler';
import { NotificationMapper } from './application/mappers/NotificationMapper';
import { AuthorizationModule } from 'src/authorization/authorization.module';

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
  NotificationSendEventHandler,
  WSTarget,
];

@Module({
  providers,
  imports: [DiscoveryModule, forwardRef(() => AuthorizationModule)],
  exports: [...providers],
})
export class NotificationModule {}
