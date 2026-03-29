import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MarkAsTestableGuard } from './infrastructure/decorators/markAsTestable.decorator';
import { TestController } from './infrastructure/controllers/test.controller';
import { CommandTokens } from 'src/common/Tokens';
import { SendTestNotificationCommand } from './application/commands/SendTestNotification.command';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: MarkAsTestableGuard,
    },
    {
      provide: CommandTokens.SendTestNotificationCommand,
      useClass: SendTestNotificationCommand,
    },
  ],
  controllers: [TestController],
})
export class TestAndSetupModule {}
