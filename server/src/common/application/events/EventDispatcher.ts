import { Inject, Injectable } from '@nestjs/common';
import { Event } from 'src/common/domain/Event';
import { IEventDispatcher } from 'src/common/domain/IEventDispatcher';
import { BaseTokens } from 'src/common/Tokens';
import type { EventHandler } from './EventHandler';

@Injectable()
export class EventDispatcher implements IEventDispatcher {
  @Inject(BaseTokens.EventHandler)
  private eventHandler: EventHandler;

  private eventList: Event<unknown>[] = [];
  addEvent(event: Event<unknown>) {
    this.eventList.push(event);
  }

  dispatchEvents() {
    this.eventList.forEach((el) => {
      setImmediate(() => {
        this.dispatchEvent(el).catch((err) => {});
      });
    });
    this.eventList = [];
  }

  private async dispatchEvent(event: Event<unknown>) {
    await this.eventHandler.handle(event);
  }
}
