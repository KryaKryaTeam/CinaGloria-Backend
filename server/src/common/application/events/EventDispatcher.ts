import { Inject, Injectable, Scope } from '@nestjs/common';
import { Event } from 'src/common/domain/Event';
import { IEventDispatcher } from 'src/common/domain/IEventDispatcher';
import { BaseTokens } from 'src/common/Tokens';
import type { EventHandler } from './EventHandler';

@Injectable({ scope: Scope.REQUEST })
export class EventDispatcher implements IEventDispatcher {
  @Inject(BaseTokens.EventHandler)
  private eventHandler: EventHandler;

  private eventList: Event<unknown>[];
  addEvent(event: Event<unknown>) {
    this.eventList.push(event);
  }
  dispatchEvents() {
    this.eventList.forEach((el) => {
      setImmediate(() => {
        this.dispatchEvent(el);
      });
    });
    this.eventList = [];
  }

  private dispatchEvent(event: Event<unknown>) {
    this.eventHandler.handle(event);
  }
}
