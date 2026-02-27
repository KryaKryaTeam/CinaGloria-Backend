import { Inject } from '@nestjs/common';
import { Event } from 'src/common/domain/Event';
import { EventType } from 'src/common/domain/EventType';
import type { IDBContext } from '../IDBcontext';
import { BaseTokens } from 'src/common/Tokens';

type TEventCallback = (payload: unknown) => void | Promise<void>;

export class EventHandler {
  @Inject(BaseTokens.DBContext)
  dbContext: IDBContext;
  eventMapping: Map<EventType, TEventCallback[]> = new Map();
  async handle(event: Event<unknown>): Promise<void> {
    const promises = this.eventMapping
      .get(event.EventType)
      ?.map(async (call) => {
        await this.dbContext.startTransaction();
        try {
          await call(event.payload);
          await this.dbContext.commitTransaction();
        } catch {
          await this.dbContext.rollbackTransaction();
        }
      });

    if (promises) await Promise.all(promises);
  }
  addListener(eventType: EventType, callback: TEventCallback) {
    const arrayOfCallbacks = this.eventMapping.get(eventType) || [];
    arrayOfCallbacks.push(callback);
    this.eventMapping.set(eventType, arrayOfCallbacks);
  }
}
