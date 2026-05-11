import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Event, IEventJSON } from 'src/common/domain/Event';
import { EventType } from 'src/common/domain/EventType';
import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';

interface payload {
  jury: UserEntity;
  round: RoundEntity;
}

export class RoundOnJudgingEvent extends Event<payload> {
  public EventType: EventType = EventType.ROUND_ON_JUDGING;
  constructor(payload: payload) {
    super(payload);
  }

  load(data: IEventJSON<payload>): Event<payload> {
    const ev = new RoundOnJudgingEvent(data.payload);
    return ev;
  }

  toJSON(): IEventJSON<payload> {
    return {
      eventType: EventType.ROUND_ON_JUDGING,
      payload: this.payload,
    };
  }
}
