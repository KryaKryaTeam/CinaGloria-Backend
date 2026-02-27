import { Event } from './Event';
import { IEventDispatcher } from './IEventDispatcher';

export class Entity {
  protected events: Event<unknown>[] = [];
  protected addEvent(event: Event<unknown>) {
    this.events.push(event);
  }
  public pullEvents(eventDispatcher: IEventDispatcher) {
    this.events.forEach((ev) => eventDispatcher.addEvent(ev));
    this.events = [];
  }
}
