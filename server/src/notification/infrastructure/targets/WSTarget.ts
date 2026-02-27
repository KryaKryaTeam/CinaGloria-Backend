import { Notification } from 'src/notification/domain/entities/Notification';
import { NotificationTarget } from '../service/NotificationService';
import {
  BaseNotificationTarget,
  INotificationData,
} from './BaseNotificationTarget';

@NotificationTarget('ws')
export class WSTarget extends BaseNotificationTarget {
  protected async _send(data: INotificationData): Promise<void> {}
  protected prepare(notification: Notification): INotificationData {
    return {
      title: notification.title,
      content: notification.content,
      to: notification.to.id,
    };
  }
}
