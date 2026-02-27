import { Event } from 'src/common/domain/Event';
import { EventType } from 'src/common/domain/EventType';
import { Notification } from '../entities/Notification';

export class SendNotificationEvent extends Event<Notification> {
  public EventType: EventType = EventType.SEND_NOTIFICATION;
}
