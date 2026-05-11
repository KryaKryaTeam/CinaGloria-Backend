import { Event, IEventJSON } from 'src/common/domain/Event';
import { RegisterEvent } from 'src/common/domain/EventRegister';
import { EventType } from 'src/common/domain/EventType';
import { RoundEntity } from '../entities/Round.entity';

@RegisterEvent
export class RoundEnded extends Event<RoundEntity> {
  public EventType: EventType = EventType.ROUND_ENDED;

  constructor(payload: RoundEntity) {
    super(payload);
  }

  load(data: IEventJSON<RoundEntity>): Event<RoundEntity> {
    const ev = new RoundEnded(data.payload);
    return ev;
  }

  toJSON(): IEventJSON<RoundEntity> {
    return {
      eventType: EventType.ROUND_ENDED,
      payload: this.payload,
    };
  }
}
