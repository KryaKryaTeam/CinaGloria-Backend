import { Notification } from 'src/notification/domain/entities/Notification';
import { NotificationTarget } from '../service/NotificationService';
import {
  BaseNotificationTarget,
  INotificationData,
} from './BaseNotificationTarget';
import { Inject } from '@nestjs/common';
import { NotificationGateway } from '../gateways/WsNotification.gateway';

@NotificationTarget('ws')
export class WSTarget extends BaseNotificationTarget {
  @Inject()
  private gateway: NotificationGateway;
  protected _send(data: INotificationData): Promise<void> | void {
    this.gateway.sendNotificationToUser(data);
  }
  protected prepare(notification: Notification): INotificationData {
    return {
      title: notification.title,
      content: notification.content,
      to: notification.to.id,
    };
  }
}
