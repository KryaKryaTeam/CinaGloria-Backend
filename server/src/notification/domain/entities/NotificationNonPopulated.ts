import { NotificationStatus } from 'src/types/NotificationStatus';

interface INotification {
  id: string;
  title: string;
  content: string;
  from: string;
  to: string;
  status: NotificationStatus;
  targets: string[];
  createdAt: Date;
}

export class NotificationNonPopulated {
  public readonly id: string;
  public readonly title: string;
  public readonly content: string;
  public readonly from: string;
  public readonly to: string;
  public readonly status: NotificationStatus;
  public readonly createdAt: Date;

  private constructor(partial: Partial<NotificationNonPopulated>) {
    Object.assign(this, partial);
  }
  public static load(obj: INotification) {
    return new NotificationNonPopulated(obj);
  }
}
