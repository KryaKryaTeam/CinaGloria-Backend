import { CompetitionArchived } from './CompetitionArchieved.event';
import { EventType } from 'src/common/domain/EventType';

describe('CompetitionArchived', () => {
  const competition = { id: 'comp-1' } as any;

  it('should create event with correct type', () => {
    const event = new CompetitionArchived(competition);

    expect(event.EventType).toBe(EventType.COMPETITION_ARCHIVED);
    expect(event.payload).toBe(competition);
  });

  it('should serialize to JSON correctly', () => {
    const event = new CompetitionArchived(competition);

    const json = event.toJSON();

    expect(json).toEqual({
      eventType: EventType.COMPETITION_ARCHIVED,
      payload: competition,
    });
  });

  it('should reconstruct event from JSON using load()', () => {
    const original = new CompetitionArchived(competition);

    const json = original.toJSON();

    const loaded = original.load(json);

    expect(loaded).toBeInstanceOf(CompetitionArchived);
    expect(loaded.payload).toBe(competition);
    expect(loaded.EventType).toBe(EventType.COMPETITION_ARCHIVED);
  });
});
