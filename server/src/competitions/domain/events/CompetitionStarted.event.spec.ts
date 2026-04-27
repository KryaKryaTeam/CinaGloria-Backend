import { CompetitionStarted } from 'src/competitions/domain/events/CompetitionStarted.event';
import { EventType } from 'src/common/domain/EventType';

describe('CompetitionStarted', () => {
  const competition = { id: 'comp-1' } as any;

  it('should create event with correct type', () => {
    const event = new CompetitionStarted(competition);

    expect(event.EventType).toBe(EventType.COMPETITION_STARTED);
    expect(event.payload).toBe(competition);
  });

  it('should serialize to JSON correctly', () => {
    const event = new CompetitionStarted(competition);

    expect(event.toJSON()).toEqual({
      eventType: EventType.COMPETITION_STARTED,
      payload: competition,
    });
  });

  it('should reconstruct event from JSON via load()', () => {
    const original = new CompetitionStarted(competition);

    const json = original.toJSON();
    const loaded = original.load(json);

    expect(loaded).toBeInstanceOf(CompetitionStarted);
    expect(loaded.payload).toBe(competition);
    expect(loaded.EventType).toBe(EventType.COMPETITION_STARTED);
  });
});
