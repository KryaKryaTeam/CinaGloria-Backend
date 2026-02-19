import { Event } from 'src/common/domain/Event';
import { EventType } from 'src/common/domain/EventType';

type TEventCallback = (payload: unknown) => void;

export class EventHandler {
  eventMapping: Map<EventType, TEventCallback[]>;
  handle(event: Event<unknown>): void {
    this.eventMapping.get(event.EventType)?.forEach((call) => {
      call(event.payload);
    });
  }
  addListener(eventType: EventType, callback: TEventCallback) {
    const arrayOfCallbacks = this.eventMapping.get(eventType) || [];
    arrayOfCallbacks.push(callback);
    this.eventMapping.set(eventType, arrayOfCallbacks);
  }
}
