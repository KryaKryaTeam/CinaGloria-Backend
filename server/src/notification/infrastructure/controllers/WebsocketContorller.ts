import { Controller, Get, Inject, Req, Version } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { randomUUID } from 'crypto';

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
  @ApiResponse({ status: 200, example: { token: randomUUID() } })
  async getTokenV1(@Req() req: ExpressRequest, @UserId() userId: string) {
    return {
      token: await this.generateTicketCommand.execute(userId),
    };
  }
}
