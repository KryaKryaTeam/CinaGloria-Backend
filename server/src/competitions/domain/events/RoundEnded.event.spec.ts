import { RoundEnded } from 'src/competitions/domain/events/RoundEnded.event';
import { EventType } from 'src/common/domain/EventType';

describe('RoundEnded', () => {
  const round = { id: 'round-1' } as any;

  it('should create event with correct type', () => {
    const event = new RoundEnded(round);

    expect(event.EventType).toBe(EventType.ROUND_ENDED);
    expect(event.payload).toBe(round);
  });

  it('should serialize to JSON correctly', () => {
    const event = new RoundEnded(round);

    expect(event.toJSON()).toEqual({
      eventType: EventType.ROUND_ENDED,
      payload: round,
    });
  });

  it('should reconstruct event from JSON via load()', () => {
    const original = new RoundEnded(round);

    const json = original.toJSON();
    const loaded = original.load(json);

    expect(loaded).toBeInstanceOf(RoundEnded);
    expect(loaded.payload).toBe(round);
    expect(loaded.EventType).toBe(EventType.ROUND_ENDED);
  });
});
