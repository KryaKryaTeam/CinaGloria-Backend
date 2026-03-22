import { Event, IEventJSON } from 'src/common/domain/Event';
import { RegisterEvent } from 'src/common/domain/EventRegister';
import { EventType } from 'src/common/domain/EventType';
import { CompetitionEntity } from 'src/competitions/domain/entities/Competition.entity';

@RegisterEvent
export class CompetitionUpdated extends Event<CompetitionEntity> {
  public EventType: EventType = EventType.COMPETITION_UPDATED;

  constructor(payload: CompetitionEntity) {
    super(payload);
  }

  load(data: IEventJSON<CompetitionEntity>): Event<CompetitionEntity> {
    const ev = new CompetitionUpdated(data.payload);
    return ev;
  }

  toJSON(): IEventJSON<CompetitionEntity> {
    return {
      eventType: EventType.COMPETITION_UPDATED,
      payload: this.payload,
    };
  }
}
