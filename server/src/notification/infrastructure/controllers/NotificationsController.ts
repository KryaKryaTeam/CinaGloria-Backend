import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Param,
  Version,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserId } from 'src/authorization/infrastructure/decorators/user.decorator';
import { Secure } from 'src/authorization/infrastructure/guards/auth/auth.guard';
import { CommandTokens } from 'src/common/Tokens';
import { GetNotificationsQuery } from 'src/notification/application/commands/GetNotificationsQuery';

@Controller('notification')
@ApiBearerAuth('main')
@Secure(true)
export class NotificationsContorller {
  @Inject(CommandTokens.GetNotificationsQuery)
  private readonly getNotificationQuery: GetNotificationsQuery;
  @Get('/:page')
  @Version('1')
  async getByPage(@Param() { page }: { page: number }, @UserId() id: string) {
    if (!page) throw new BadRequestException('Page param is undefined!');
    return await this.getNotificationQuery.execute({ page, id });
  }
}
