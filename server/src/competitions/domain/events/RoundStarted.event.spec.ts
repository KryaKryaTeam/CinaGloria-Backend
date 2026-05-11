import { RoundStarted } from 'src/competitions/domain/events/RoundStarted.event';
import { EventType } from 'src/common/domain/EventType';

describe('RoundStarted', () => {
  const round = { id: 'round-1' } as any;

  it('should create event with correct type', () => {
    const event = new RoundStarted(round);

    expect(event.EventType).toBe(EventType.ROUND_STARTED);
    expect(event.payload).toBe(round);
  });

  it('should serialize to JSON correctly', () => {
    const event = new RoundStarted(round);

    expect(event.toJSON()).toEqual({
      eventType: EventType.ROUND_STARTED,
      payload: round,
    });
  });

  it('should reconstruct event from JSON via load()', () => {
    const original = new RoundStarted(round);

    const json = original.toJSON();
    const loaded = original.load(json);

    expect(loaded).toBeInstanceOf(RoundStarted);
    expect(loaded.payload).toBe(round);
    expect(loaded.EventType).toBe(EventType.ROUND_STARTED);
  });
});
