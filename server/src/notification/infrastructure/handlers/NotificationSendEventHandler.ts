import { Inject, Injectable } from '@nestjs/common';
import { EventHandler } from 'src/common/application/events/EventHandler';
import { EventType } from 'src/common/domain/EventType';
import { BaseTokens, ServiceTokens } from 'src/common/Tokens';
import type { INotificationService } from 'src/notification/application/bounds/INotificationService';
import { Notification } from 'src/notification/domain/entities/Notification';

@Injectable()
export class NotificationSendEventHandler {
  constructor(
    @Inject(BaseTokens.EventHandler) private eventHandler: EventHandler,
    @Inject(ServiceTokens.NotificationService)
    private notificationService: INotificationService,
  ) {
    eventHandler.addListener(
      EventType.SEND_NOTIFICATION,
      async (payload: Notification) => {
        await this.notificationService.sendNotification(payload);
      },
    );
  }
}
