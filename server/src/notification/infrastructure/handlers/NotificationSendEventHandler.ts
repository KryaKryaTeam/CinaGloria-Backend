import { Inject, Injectable } from '@nestjs/common';
import { EventHandler } from 'src/common/application/events/EventHandler';
import { EventType } from 'src/common/domain/EventType';
import { BaseTokens, ReposTokens, ServiceTokens } from 'src/common/Tokens';
import type { INotificationRepository } from 'src/notification/application/bounds/INotificationRepository';
import type { INotificationService } from 'src/notification/application/bounds/INotificationService';
import { Notification } from 'src/notification/domain/entities/Notification';

@Injectable()
export class NotificationSendEventHandler {
  constructor(
    @Inject(BaseTokens.EventHandler) private eventHandler: EventHandler,
    @Inject(ServiceTokens.NotificationService)
    private notificationService: INotificationService,

    @Inject(ReposTokens.NotificationRepository)
    private notificationRepository: INotificationRepository,
  ) {
    eventHandler.addListener(
      EventType.SEND_NOTIFICATION,
      async (payload: Notification) => {
        await this.notificationRepository.save(payload);
        console.log('SENDING NOTIFICATION!', payload);
        await this.notificationService.sendNotification(payload);
      },
    );
  }
}
