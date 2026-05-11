import { Event, IEventJSON } from 'src/common/domain/Event';
import { EventType } from 'src/common/domain/EventType';
import { TeamEntity } from '../entities/Team.entity';

export class CaptainChangedEvent extends Event<{
  captainId: string;
  team: TeamEntity;
}> {
  public EventType: EventType = EventType.CAPTAIN_CHANGED;

  constructor(payload: { captainId: string; team: TeamEntity }) {
    super(payload);
  }

  load(
    data: IEventJSON<{ captainId: string; team: TeamEntity }>,
  ): Event<{ captainId: string; team: TeamEntity }> {
    const ev = new CaptainChangedEvent(data.payload);
    return ev;
  }

  toJSON(): IEventJSON<{ captainId: string; team: TeamEntity }> {
    return {
      eventType: this.EventType,
      payload: this.payload,
    };
  }
}
