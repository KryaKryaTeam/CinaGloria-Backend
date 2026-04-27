import { EventType } from 'src/common/domain/EventType';
import { CompetitionCanceled } from 'src/competitions/domain/events/CompetitionCanceled.event';

describe('CompetitionCanceled', () => {
  const competition = { id: 'comp-1' } as any;

  it('should create event with correct type', () => {
    const event = new CompetitionCanceled(competition);

    expect(event.EventType).toBe(EventType.COMPETITION_CANCELED);
    expect(event.payload).toBe(competition);
  });

  it('should serialize to JSON correctly', () => {
    const event = new CompetitionCanceled(competition);

    expect(event.toJSON()).toEqual({
      eventType: EventType.COMPETITION_CANCELED,
      payload: competition,
    });
  });

  it('should reconstruct event from JSON via load()', () => {
    const original = new CompetitionCanceled(competition);

    const json = original.toJSON();

    const loaded = original.load(json);

    expect(loaded).toBeInstanceOf(CompetitionCanceled);
    expect(loaded.payload).toBe(competition);
    expect(loaded.EventType).toBe(EventType.COMPETITION_CANCELED);
  });
});
