import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { INotificationData } from '../targets/BaseNotificationTarget';
import { Inject } from '@nestjs/common';
import { ServiceTokens } from 'src/common/Tokens';
import type { ITicketService } from 'src/notification/application/bounds/ITicketService';

@WebSocketGateway(Number(process.env.WEBSOCKET_PORT) ?? 4001, {
  namespace: 'notification',
  path: '/ws',
  cors: {
    origin: process.env.ALLOWED_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  },
})
export class NotificationGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  @Inject(ServiceTokens.WsTicketService)
  private ticketService: ITicketService;

  async handleConnection(client: Socket) {
    const requestToken = client.handshake.auth.token as string | null;
    if (!requestToken) {
      client.disconnect();
      return;
    }

    try {
      const data = this.ticketService.validate(requestToken);
      await client.join(data);
    } catch {
      client.disconnect();
      return;
    }
  }

  sendNotificationToUser(notification: INotificationData) {
    this.server.to(notification.to).emit('new_notification', notification);
  }
}
