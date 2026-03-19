import { Inject, Logger } from '@nestjs/common';
import { Event } from 'src/common/domain/Event';
import { EventType } from 'src/common/domain/EventType';
import type { IDBContext } from '../IDBcontext';
import { BaseTokens } from 'src/common/Tokens';

type TEventCallback = (payload: unknown) => void | Promise<void>;

export class EventHandler {
  private readonly logger = new Logger(EventHandler.name);
  @Inject(BaseTokens.DBContext)
  dbContext: IDBContext;

  private readonly eventMapping: Map<EventType, TEventCallback[]> = new Map();

  async handle(event: Event<unknown>): Promise<void> {
    const callbacks = this.eventMapping.get(event.EventType) || [];
    this.logger.log(
      `Dispatching ${event.EventType} to ${callbacks.length} handlers`,
    );

    for (const [index, call] of callbacks.entries()) {
      try {
        await this.dbContext.isolate(async () => {
          this.logger.log(
            `Starting handler #${index + 1} for ${event.EventType}`,
          );
          await call(event.payload);
          this.logger.log(
            `Finished handler #${index + 1} for ${event.EventType}`,
          );
        });
      } catch (err) {
        this.logger.error(
          `Handler #${index + 1} failed: ${(err as Error).message}`,
        );
      }
    }

    this.logger.log(`All handlers for ${event.EventType} processed`);
  }
  addListener(eventType: EventType, callback: TEventCallback) {
    this.logger.log(`Event handler added for event: ${eventType}`);
    const arrayOfCallbacks = this.eventMapping.get(eventType) || [];
    arrayOfCallbacks.push(callback);
    this.eventMapping.set(eventType, arrayOfCallbacks);
    console.log(arrayOfCallbacks);
  }
}
