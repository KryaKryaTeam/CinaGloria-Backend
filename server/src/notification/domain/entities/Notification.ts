import { randomUUID } from 'crypto';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { DomainError, DomainErrors } from 'src/error/DomainError';
import { NotificationStatus } from 'src/types/NotificationStatus';

interface INotification {
  id: string;
  title: string;
  content: string;
  from: string;
  to: UserEntity;
  status: NotificationStatus;
  targets: string[];
}

export class Notification {
  public readonly id: string;
  public readonly title: string;
  public readonly content: string;
  public readonly from: string;
  public readonly to: UserEntity;
  private _status: NotificationStatus;
  public readonly targets: string[];

  private constructor(partial: Partial<Notification>) {
    Object.assign(this, partial);
  }

  public static create(obj: {
    title: string;
    content: string;
    from: string;
    to: UserEntity;
    targets: string[];
  }) {
    if (obj.title.length < 5 || obj.title.length > 100)
      throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

    return new Notification({
      id: randomUUID(),
      status: NotificationStatus.sended,
      ...obj,
    });
  }

  public static load(obj: INotification) {
    return new Notification(obj);
  }

  get status() {
    return this._status;
  }

  set status(NextStatus: NotificationStatus) {
    if (this._status == NotificationStatus.readed)
      throw new DomainError(DomainErrors.UNEXPECTED_VALUE);
    if (this._status == NextStatus)
      throw new DomainError(DomainErrors.NO_CHANGE);

    this._status = NextStatus;
  }
}
