import { Controller, Get, Inject, Param, Put, Version } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';

import { UserId } from 'src/authorization/infrastructure/decorators/user.decorator';
import { Secure } from 'src/authorization/infrastructure/guards/auth/auth.guard';
import { CommandTokens } from 'src/common/Tokens';
import { CommonErrors, documentError } from 'src/error/ApiError';
import { GetNotificationsQuery } from 'src/notification/application/commands/GetNotificationsQuery';
import { MakeNotificationReaded } from 'src/notification/application/commands/MakeNotificationReadedCommand';
import { MarkAllNotificationsReadCommand } from 'src/notification/application/commands/MarkAllNotificationsRead.command';
import { NotificationDto } from '../dto/Notification.dto';
import { PageQueryDto } from 'src/common/infrastructure/dto/PageQuery.dto';
import { randomUUID } from 'crypto';

@Controller('/notification')
@Secure()
export class NotificationsController {
  @Inject(CommandTokens.GetNotificationsQuery)
  private readonly getNotificationQuery: GetNotificationsQuery;

  @Inject(CommandTokens.MakeNotificationReadCommand)
  private readonly makeNotificationReaded: MakeNotificationReaded;

  @Inject(CommandTokens.MarkAllNotificationsReadCommand)
  private readonly markAllNotificationsReadCommand: MarkAllNotificationsReadCommand;
  @Get('/:page')
  @Version('1')
  @ApiResponse({ status: 200, type: [NotificationDto] })
  @documentError([CommonErrors.PAGE_IS_EMPTY])
  async getByPage(@Param() pageDto: PageQueryDto, @UserId() id: string) {
    return await this.getNotificationQuery.execute({ page: pageDto.page, id });
  }

  @Put('/one/:notificationId')
  @Version('1')
  @ApiResponse({ status: 200, example: { notificationId: randomUUID() } })
  async promoteToReaded(
    @Param() { notificationId }: { notificationId: string },
    @UserId() user: UserEntity,
  ) {
    await this.makeNotificationReaded.execute({ notificationId, user });
    return { notificationId };
  }

  @Put('/all')
  @Version('1')
  async promoteToReadAll(@UserId() user: UserEntity) {
    await this.markAllNotificationsReadCommand.execute({ user });
  }
}
