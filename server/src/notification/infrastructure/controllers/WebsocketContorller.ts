import { Controller, Get, Inject, Req, Version } from '@nestjs/common';
import { ApiBasicAuth } from '@nestjs/swagger';
import type { Request as ExpressRequest } from 'express';
import { Secure } from 'src/authorization/infrastructure/guards/auth/auth.guard';
import { CommandTokens } from 'src/common/Tokens';
import { DomainError, DomainErrors } from 'src/error/DomainError';
import { GenerateTicketCommand } from 'src/notification/application/commands/GenerateTicketCommand';

@Controller('/ws')
export class WSContorller {
  @Inject(CommandTokens.GenerateTicketCommand)
  private generateTicketCommand: GenerateTicketCommand;

  @Get('token')
  @Secure(true)
  @Version('1')
  @ApiBasicAuth()
  async getTokenV1(@Req() req: ExpressRequest) {
    if (!req['user_id']) throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

    return {
      token: await this.generateTicketCommand.execute(req['user_id'] as string),
    };
  }
}
