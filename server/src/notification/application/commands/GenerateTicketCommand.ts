import { Inject } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import type { ITicketService } from '../bounds/ITicketService';
import { ServiceTokens } from 'src/common/Tokens';

export class GenerateTicketCommand extends Command<string, string> {
  @Inject(ServiceTokens.WsTicketService)
  private ticketService: ITicketService;

  implementation(data: string): string {
    return this.ticketService.generate(data);
  }
}
