import { Controller, Inject, Param, Post } from '@nestjs/common';
import { MarkAsTestable } from '../decorators/markAsTestable.decorator';
import { Secure } from 'src/authorization/infrastructure/guards/auth/auth.guard';
import { IdOrMeDto } from '../dto/IdOrMe.dto';
import { CommandTokens } from 'src/common/Tokens';
import { SendTestNotificationCommand } from 'src/test-and-setup/application/commands/SendTestNotification.command';
import { UserId } from 'src/authorization/infrastructure/decorators/user.decorator';

@Controller('/test')
@MarkAsTestable()
export class TestController {
  @Inject(CommandTokens.SendTestNotificationCommand)
  private readonly sendTestNotificationCommand: SendTestNotificationCommand;

  @Post('/sendTestNotification/:id')
  @Secure()
  async sendTestNotification(
    @Param() dto: IdOrMeDto,
    @UserId() userId: string,
  ) {
    await this.sendTestNotificationCommand.execute({
      sendToId: dto.id == 'me' ? userId : dto.id,
    });
  }
}
