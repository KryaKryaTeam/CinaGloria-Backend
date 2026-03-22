import { Event, IEventJSON } from 'src/common/domain/Event';
import { RegisterEvent } from 'src/common/domain/EventRegister';
import { EventType } from 'src/common/domain/EventType';
import { CompetitionEntity } from 'src/competitions/domain/entities/Competition.entity';

@RegisterEvent
export class CompetitionCanceled extends Event<CompetitionEntity> {
  public EventType: EventType = EventType.COMPETITION_CANCELED;

  constructor(payload: CompetitionEntity) {
    super(payload);
  }

  load(data: IEventJSON<CompetitionEntity>): Event<CompetitionEntity> {
    const ev = new CompetitionCanceled(data.payload);
    return ev;
  }

  toJSON(): IEventJSON<CompetitionEntity> {
    return {
      eventType: EventType.COMPETITION_CANCELED,
      payload: this.payload,
    };
  }
}
