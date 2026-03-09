import { Event, IEventJSON } from 'src/common/domain/Event';
import { UserEntity } from '../entities/User.entity';
import { EventType } from 'src/common/domain/EventType';
import { RegisterEvent } from 'src/common/domain/EventRegister';

@RegisterEvent
export class UserCreated extends Event<UserEntity> {
  public EventType: EventType = EventType.USER_CREATED;
  constructor(payload: UserEntity) {
    super(payload);
  }

  toJSON(): IEventJSON<UserEntity> {
    return {
      eventType: this.EventType,
      payload: this.payload,
    };
  }

  load(data: IEventJSON<UserEntity>): Event<UserEntity> {
    const ev = new UserCreated(data.payload);
    return ev;
  }
}
