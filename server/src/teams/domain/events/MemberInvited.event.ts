import { Event, IEventJSON } from 'src/common/domain/Event';
import { EventType } from 'src/common/domain/EventType';
import { TeamEntity } from '../entities/Team.entity';

export class MemberInvitedEvent extends Event<{
  userId: string;
  team: TeamEntity;
}> {
  public EventType: EventType = EventType.MEMBER_INVITED;

  constructor(payload: { userId: string; team: TeamEntity }) {
    super(payload);
  }

  load(
    data: IEventJSON<{ userId: string; team: TeamEntity }>,
  ): Event<{ userId: string; team: TeamEntity }> {
    const ev = new MemberInvitedEvent(data.payload);
    return ev;
  }

  toJSON(): IEventJSON<{ userId: string; team: TeamEntity }> {
    return {
      eventType: this.EventType,
      payload: this.payload,
    };
  }
}
