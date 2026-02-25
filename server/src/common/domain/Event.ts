import { EventType } from './EventType';

export abstract class Event<T> {
  public readonly payload: T;
  public abstract readonly EventType: EventType;

  constructor(payload: T) {
    this.payload = Object.freeze(payload);
  }
}
