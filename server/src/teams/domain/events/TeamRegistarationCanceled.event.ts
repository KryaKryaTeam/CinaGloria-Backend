import { Event, IEventJSON } from 'src/common/domain/Event';
import { EventType } from 'src/common/domain/EventType';
import { TeamEntity } from '../entities/Team.entity';

export class TeamRegistarationCanceledEvent extends Event<{
  team: TeamEntity;
  competitionId: string;
}> {
  public EventType: EventType = EventType.TEAM_REGISTRATION_CANCELED;

  constructor(payload: { team: TeamEntity; competitionId: string }) {
    super(payload);
  }

  load(
    data: IEventJSON<{ team: TeamEntity; competitionId: string }>,
  ): Event<{ team: TeamEntity; competitionId: string }> {
    const ev = new TeamRegistarationCanceledEvent(data.payload);
    return ev;
  }

  toJSON(): IEventJSON<{ team: TeamEntity; competitionId: string }> {
    return {
      eventType: this.EventType,
      payload: this.payload,
    };
  }
}
