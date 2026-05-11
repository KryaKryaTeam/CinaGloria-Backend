import { Event, IEventJSON } from 'src/common/domain/Event';
import { EventType } from 'src/common/domain/EventType';
import { TeamEntity } from '../entities/Team.entity';

export class MemberInvitedForCompetitionEvent extends Event<{
  memberId: string;
  team: TeamEntity;
  competitionId: string;
}> {
  public EventType: EventType = EventType.MEMBER_INVITED_FOR_COMPETITION;

  constructor(payload: {
    memberId: string;
    team: TeamEntity;
    competitionId: string;
  }) {
    super(payload);
  }

  load(
    data: IEventJSON<{
      memberId: string;
      team: TeamEntity;
      competitionId: string;
    }>,
  ): Event<{ memberId: string; team: TeamEntity; competitionId: string }> {
    const ev = new MemberInvitedForCompetitionEvent(data.payload);
    return ev;
  }

  toJSON(): IEventJSON<{
    memberId: string;
    team: TeamEntity;
    competitionId: string;
  }> {
    return {
      eventType: this.EventType,
      payload: this.payload,
    };
  }
}
