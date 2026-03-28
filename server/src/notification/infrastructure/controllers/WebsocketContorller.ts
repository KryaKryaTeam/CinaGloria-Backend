import { Controller, Get, Inject, Req, Version } from '@nestjs/common';

import type { Request as ExpressRequest } from 'express';
import { UserId } from 'src/authorization/infrastructure/decorators/user.decorator';
import { Secure } from 'src/authorization/infrastructure/guards/auth/auth.guard';
import { CommandTokens } from 'src/common/Tokens';
import { documentError, NotificationErrors } from 'src/error/ApiError';
import { GenerateTicketCommand } from 'src/notification/application/commands/GenerateTicketCommand';

@Controller('/ws')
export class WSController {
  @Inject(CommandTokens.GenerateTicketCommand)
  private generateTicketCommand: GenerateTicketCommand;

  @Get('token')
  @Secure()
  @Version('1')
  @documentError(NotificationErrors.TICKER_SERVICE_ERROR)
  async getTokenV1(@Req() req: ExpressRequest, @UserId() userId: string) {
    return {
      token: await this.generateTicketCommand.execute(userId),
    };
  }
}
