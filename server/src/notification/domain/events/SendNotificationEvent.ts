import { Event, IEventJSON } from 'src/common/domain/Event';
import { EventType } from 'src/common/domain/EventType';
import { Notification } from '../entities/Notification';

export class SendNotificationEvent extends Event<Notification> {
  public EventType: EventType = EventType.SEND_NOTIFICATION;

  load(data: IEventJSON<Notification>): Event<Notification> {
    const ev = new SendNotificationEvent(data.payload);
    return ev;
  }
  toJSON(): IEventJSON<Notification> {
    return {
      eventType: this.EventType,
      payload: this.payload,
    };
  }
}
