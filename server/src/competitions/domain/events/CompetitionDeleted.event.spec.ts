import { CompetitionDeleted } from 'src/competitions/domain/events/CompetitionDeleted.event';
import { EventType } from 'src/common/domain/EventType';

describe('CompetitionDeleted', () => {
  const competition = { id: 'comp-1' } as any;

  it('should create event with correct type', () => {
    const event = new CompetitionDeleted(competition);

    expect(event.EventType).toBe(EventType.COMPETITION_DELETED);
    expect(event.payload).toBe(competition);
  });

  it('should serialize to JSON correctly', () => {
    const event = new CompetitionDeleted(competition);

    expect(event.toJSON()).toEqual({
      eventType: EventType.COMPETITION_DELETED,
      payload: competition,
    });
  });

  it('should reconstruct event from JSON via load()', () => {
    const original = new CompetitionDeleted(competition);

    const json = original.toJSON();

    const loaded = original.load(json);

    expect(loaded).toBeInstanceOf(CompetitionDeleted);
    expect(loaded.payload).toBe(competition);
    expect(loaded.EventType).toBe(EventType.COMPETITION_DELETED);
  });
});
