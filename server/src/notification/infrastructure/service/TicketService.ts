import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { DomainError, DomainErrors } from 'src/error/DomainError';
import { ITicketService } from 'src/notification/application/bounds/ITicketService';

export class TicketService implements ITicketService {
  @Inject()
  private jwtService: JwtService;

  @Inject()
  private configurationService: ConfigService;

  generate(userId: string): string {
    return this.jwtService.sign({ userId }, {
      secret: this.configurationService.getOrThrow<string>('ws.secret'),
      expiresIn: '1m',
    } as JwtSignOptions);
  }
  validate(token: string): string {
    try {
      return this.jwtService.verify<{ userId: string }>(token, {
        secret: this.configurationService.getOrThrow<string>('ws.secret'),
      }).userId;
    } catch {
      throw new DomainError(DomainErrors.UNEXPECTED_VALUE);
    }
  }
}
