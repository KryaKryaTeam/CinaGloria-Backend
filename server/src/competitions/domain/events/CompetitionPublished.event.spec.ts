import { CompetitionPublished } from 'src/competitions/domain/events/CompetitionPublished.event';
import { EventType } from 'src/common/domain/EventType';

describe('CompetitionPublished', () => {
  const competition = { id: 'comp-1' } as any;

  it('should create event with correct type', () => {
    const event = new CompetitionPublished(competition);

    expect(event.EventType).toBe(EventType.COMPETITION_PUBLISHED);
    expect(event.payload).toBe(competition);
  });

  it('should serialize to JSON correctly', () => {
    const event = new CompetitionPublished(competition);

    const json = event.toJSON();

    expect(json).toEqual({
      eventType: EventType.COMPETITION_PUBLISHED,
      payload: competition,
    });
  });

  it('should reconstruct event from JSON via load()', () => {
    const original = new CompetitionPublished(competition);

    const loaded = original.load(original.toJSON());

    expect(loaded).toBeInstanceOf(CompetitionPublished);
    expect(loaded.payload).toBe(competition);
    expect(loaded.EventType).toBe(EventType.COMPETITION_PUBLISHED);
  });
});
