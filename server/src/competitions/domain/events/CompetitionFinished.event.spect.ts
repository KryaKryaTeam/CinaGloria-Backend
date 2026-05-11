import { CompetitionFinished } from 'src/competitions/domain/events/CompetitionFinished.event';
import { EventType } from 'src/common/domain/EventType';

describe('CompetitionFinished', () => {
  const competition = { id: 'comp-1' } as any;

  it('should create event with correct type', () => {
    const event = new CompetitionFinished(competition);

    expect(event.EventType).toBe(EventType.COMPETITION_FINISHED);
    expect(event.payload).toBe(competition);
  });

  it('should serialize to JSON correctly', () => {
    const event = new CompetitionFinished(competition);

    expect(event.toJSON()).toEqual({
      eventType: EventType.COMPETITION_FINISHED,
      payload: competition,
    });
  });

  it('should reconstruct event from JSON via load()', () => {
    const original = new CompetitionFinished(competition);

    const json = original.toJSON();

    const loaded = original.load(json);

    expect(loaded).toBeInstanceOf(CompetitionFinished);
    expect(loaded.payload).toBe(competition);
    expect(loaded.EventType).toBe(EventType.COMPETITION_FINISHED);
  });
});
