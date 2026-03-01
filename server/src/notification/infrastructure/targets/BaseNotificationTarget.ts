import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Notification } from 'src/notification/domain/entities/Notification';

export interface INotificationData {
  title: string;
  content: string;
  to: string;
}

@Injectable()
export abstract class BaseNotificationTarget {
  @Inject()
  protected readonly configurationService: ConfigService;

  protected abstract _send(data: INotificationData): Promise<void> | void;
  protected abstract prepare(
    notification: Notification,
  ): INotificationData | Promise<INotificationData>;

  public async send(notification: Notification): Promise<void> {
    const preparedData = await this.prepare(notification);

    await this._send(preparedData);
  }
}
