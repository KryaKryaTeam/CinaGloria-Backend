import { CompetitionCreated } from 'src/competitions/domain/events/CompetitionCreated.event';
import { EventType } from 'src/common/domain/EventType';

describe('CompetitionCreated', () => {
  const competition = { id: 'comp-1' } as any;

  it('should create event with correct type', () => {
    const event = new CompetitionCreated(competition);

    expect(event.EventType).toBe(EventType.COMPETITION_CREATED);
    expect(event.payload).toBe(competition);
  });

  it('should serialize to JSON correctly', () => {
    const event = new CompetitionCreated(competition);

    expect(event.toJSON()).toEqual({
      eventType: EventType.COMPETITION_CREATED,
      payload: competition,
    });
  });

  it('should reconstruct event from JSON via load()', () => {
    const original = new CompetitionCreated(competition);

    const json = original.toJSON();

    const loaded = original.load(json);

    expect(loaded).toBeInstanceOf(CompetitionCreated);
    expect(loaded.payload).toBe(competition);
    expect(loaded.EventType).toBe(EventType.COMPETITION_CREATED);
  });
});
