import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MarkAsTestableGuard } from './infrastructure/decorators/markAsTestable.decorator';
import { TestController } from './infrastructure/controllers/test.controller';
import { CommandTokens } from 'src/common/Tokens';
import { SendTestNotificationCommand } from './application/commands/SendTestNotification.command';
import { AuthorizationModule } from 'src/authorization/authorization.module';
import { FilesModule } from 'src/files/files.module';
import { CreateAdminRunner } from './infrastructure/commands/CreateSuperUser.command';

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
    CreateAdminRunner,
  ],
  imports: [AuthorizationModule, FilesModule],
  controllers: [TestController],
})
export class TestAndSetupModule {}
