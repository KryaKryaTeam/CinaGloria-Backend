import { Injectable } from '@nestjs/common';
import { Notification } from 'src/notification/domain/entities/Notification';

export interface INotificationData {
  title: string;
  content: string;
  to: string;
}

@Injectable()
export abstract class BaseNotificationTarget {
  protected abstract _send(data: INotificationData): Promise<void>;
  protected abstract prepare(notification: Notification): INotificationData;

  public async send(notification: Notification): Promise<void> {
    const preparedData = this.prepare(notification);

    await this._send(preparedData);
  }
}
