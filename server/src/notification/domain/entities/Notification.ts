import { randomUUID } from 'crypto';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { ApiError, DomainErrors } from 'src/error/ApiError';
import { NotificationStatus } from 'src/types/NotificationStatus';

interface INotification {
  id: string;
  title: string;
  content: string;
  from: string;
  to: Record<string, string>;
  status: NotificationStatus;
  targets: string[];
  createdAt: Date;
}

export class Notification {
  private readonly _id: string;
  private readonly _title: string;
  private readonly _content: string;
  private readonly _from: string;
  private readonly _to: Record<string, string>;
  private _status: NotificationStatus;
  private readonly _targets: string[];
  private readonly _createdAt: Date;

  private constructor(props: INotification) {
    this._id = props.id;
    this._title = props.title;
    this._content = props.content;
    this._from = props.from;
    this._to = props.to;
    this._status = props.status;
    this._targets = props.targets;
    this._createdAt = props.createdAt;
  }

  public static create(props: {
    title: string;
    content: string;
    from: string;
    to: UserEntity | Record<string, string>;
    targets: string[];
  }): Notification {
    if (props.title.length < 5 || props.title.length > 100) {
      ApiError.throw(DomainErrors.UNEXPECTED_VALUE);
    }

    const _to =
      props.to instanceof UserEntity
        ? { ws: props.to.id, email: props.to.email }
        : props.to;

    return new Notification({
      ...props,
      to: _to,
      id: randomUUID(),
      status: NotificationStatus.sended,
      createdAt: new Date(),
    });
  }

  public static load(props: INotification): Notification {
    return new Notification(props);
  }

  get id() {
    return this._id;
  }
  get status() {
    return this._status;
  }
  get to() {
    return this._to;
  }
  get content() {
    return this._content;
  }
  get title() {
    return this._title;
  }
  get targets() {
    return this._targets;
  }
  get from() {
    return this._from;
  }
  get createdAt() {
    return this._createdAt;
  }

  public markAsRead(actorId: string): void {
    if (this._to.ws !== actorId) {
      ApiError.throw(DomainErrors.RESTRICTED_CHANGE);
    }

    if (this._status === NotificationStatus.readed) {
      return;
    }

    this._status = NotificationStatus.readed;
  }
}
