import { Logger } from '@nestjs/common';
import { performance } from 'node:perf_hooks';
import { EventDispatcher } from 'src/common/application/events/EventDispatcher';

interface CommandMetric {
  command: string;
  duration: number;
  timestamp: number;
}

export function MeasureExecTime(dispatcher: EventDispatcher) {
  const logger = new Logger('CommandMetrics');

  return function (
    _target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value as (
      ...args: unknown[]
    ) => Promise<unknown>;

    if (!originalMethod) return descriptor;

    descriptor.value = async function (...args: unknown[]) {
      const start = performance.now();

      const result = await originalMethod.apply(this, args);

      const duration = performance.now() - start;

      const event: CommandMetric = {
        command: propertyKey,
        duration,
        timestamp: Date.now(),
      };

      setImmediate(() => {
        logger.log(`${propertyKey} took ${duration.toFixed(2)}ms`);
        dispatcher.dispatchEvents(event);
      });

      return result;
    };

    return descriptor;
  };
}
