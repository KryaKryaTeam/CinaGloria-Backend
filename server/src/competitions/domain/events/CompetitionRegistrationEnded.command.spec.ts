import { CompetitionRegistrationEnded } from 'src/competitions/domain/events/CompetititonRegistrationStarted.event';
import { EventType } from 'src/common/domain/EventType';

describe('CompetitionRegistrationEnded', () => {
  const competition = { id: 'comp-1' } as any;

  it('should create event with correct type', () => {
    const event = new CompetitionRegistrationEnded(competition);

    expect(event.EventType).toBe(EventType.COMPETITION_REGISTRATION_ENDED);
    expect(event.payload).toBe(competition);
  });

  it('should serialize to JSON correctly', () => {
    const event = new CompetitionRegistrationEnded(competition);

    expect(event.toJSON()).toEqual({
      eventType: EventType.COMPETITION_REGISTRATION_ENDED,
      payload: competition,
    });
  });

  it('should reconstruct event from JSON via load()', () => {
    const original = new CompetitionRegistrationEnded(competition);

    const json = original.toJSON();
    const loaded = original.load(json);

    expect(loaded).toBeInstanceOf(CompetitionRegistrationEnded);
    expect(loaded.payload).toBe(competition);
    expect(loaded.EventType).toBe(EventType.COMPETITION_REGISTRATION_ENDED);
  });
});
