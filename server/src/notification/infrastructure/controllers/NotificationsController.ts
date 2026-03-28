import { Controller, Get, Inject, Param, Put, Version } from '@nestjs/common';

import { UserId } from 'src/authorization/infrastructure/decorators/user.decorator';
import { Secure } from 'src/authorization/infrastructure/guards/auth/auth.guard';
import { CommandTokens } from 'src/common/Tokens';
import { ApiError, CommonErrors } from 'src/error/ApiError';
import { GetNotificationsQuery } from 'src/notification/application/commands/GetNotificationsQuery';
import { MakeNotificationReaded } from 'src/notification/application/commands/MakeNotificationReadedCommand';

@Controller('/notification')
@Secure()
export class NotificationsController {
  @Inject(CommandTokens.GetNotificationsQuery)
  private readonly getNotificationQuery: GetNotificationsQuery;

  @Inject(CommandTokens.MakeNotificationReaded)
  private readonly makeNotificationReaded: MakeNotificationReaded;

  @Get('/:page')
  @Version('1')
  async getByPage(@Param() { page }: { page: number }, @UserId() id: string) {
    if (!page) ApiError.throw(CommonErrors.PAGE_IS_EMPTY);
    return await this.getNotificationQuery.execute({ page, id });
  }

  @Put('/:notificationId')
  @Version('1')
  async promoteToReaded(
    @Param() { notificationId }: { notificationId: string },
    @UserId() id: string,
  ) {
    await this.makeNotificationReaded.execute({ notificationId, id });
  }
}
