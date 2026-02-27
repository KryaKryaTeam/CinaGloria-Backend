import { Event } from 'src/common/domain/Event';
import { EventType } from 'src/common/domain/EventType';

type TEventCallback = (payload: unknown) => void | Promise<void>;

export class EventHandler {
  eventMapping: Map<EventType, TEventCallback[]> = new Map();
  async handle(event: Event<unknown>): Promise<void> {
    const promises = this.eventMapping
      .get(event.EventType)
      ?.map(async (call) => {
        await call(event.payload);
      });

    if (promises) await Promise.all(promises);
  }
  addListener(eventType: EventType, callback: TEventCallback) {
    const arrayOfCallbacks = this.eventMapping.get(eventType) || [];
    arrayOfCallbacks.push(callback);
    this.eventMapping.set(eventType, arrayOfCallbacks);
  }
}
