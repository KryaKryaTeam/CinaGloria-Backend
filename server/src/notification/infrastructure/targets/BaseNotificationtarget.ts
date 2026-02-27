import { Notification } from 'src/notification/domain/entities/Notification';

interface NotificationData {
  title: string;
  content: string;
}

export abstract class BaseNotificationTarget {
  protected abstract _send(data: NotificationData): Promise<void>;
  protected abstract prepare(notification: Notification): NotificationData;

  public async send(notification: Notification): Promise<void> {
    const preparedData = this.prepare(notification);

    await this._send(preparedData);
  }
}
