import { Event, IEventJSON } from 'src/common/domain/Event';
import { EventType } from 'src/common/domain/EventType';
import { TeamEntity } from '../entities/Team.entity';

export class MemberAcceptedInviteEvent extends Event<{
  memberId: string;
  team: TeamEntity;
}> {
  public EventType: EventType = EventType.MEMBER_ACCEPT_INVITE;

  constructor(payload: { memberId: string; team: TeamEntity }) {
    super(payload);
  }

  load(
    data: IEventJSON<{ memberId: string; team: TeamEntity }>,
  ): Event<{ memberId: string; team: TeamEntity }> {
    const ev = new MemberAcceptedInviteEvent(data.payload);
    return ev;
  }

  toJSON(): IEventJSON<{ memberId: string; team: TeamEntity }> {
    return {
      eventType: this.EventType,
      payload: this.payload,
    };
  }
}
