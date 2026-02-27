import { Module, Provider } from '@nestjs/common';
import { ServiceTokens } from 'src/common/Tokens';
import { NotificationService } from './infrastructure/service/NotificationService';
import { WSTarget } from './infrastructure/targets/WSTarget';
import { DiscoveryModule, DiscoveryService } from '@nestjs/core';
import { NotificationSendEventHandler } from './infrastructure/handlers/NotificationSendEventHandler';

const providers: Provider[] = [
  DiscoveryService,
  {
    provide: ServiceTokens.NotificationService,
    useClass: NotificationService,
  },
  NotificationSendEventHandler,
  WSTarget,
];

@Module({
  providers,
  imports: [DiscoveryModule],
})
export class NotificationModule {}
