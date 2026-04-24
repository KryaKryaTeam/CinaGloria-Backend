import { CompetitionUpdated } from 'src/competitions/domain/events/CompetitionUpdated.event';
import { EventType } from 'src/common/domain/EventType';

describe('CompetitionUpdated', () => {
  const competition = { id: 'comp-1' } as any;

  it('should create event with correct type', () => {
    const event = new CompetitionUpdated(competition);

    expect(event.EventType).toBe(EventType.COMPETITION_UPDATED);
    expect(event.payload).toBe(competition);
  });

  it('should serialize to JSON correctly', () => {
    const event = new CompetitionUpdated(competition);

    expect(event.toJSON()).toEqual({
      eventType: EventType.COMPETITION_UPDATED,
      payload: competition,
    });
  });

  it('should reconstruct event from JSON via load()', () => {
    const original = new CompetitionUpdated(competition);

    const json = original.toJSON();
    const loaded = original.load(json);

    expect(loaded).toBeInstanceOf(CompetitionUpdated);
    expect(loaded.payload).toBe(competition);
    expect(loaded.EventType).toBe(EventType.COMPETITION_UPDATED);
  });
});
