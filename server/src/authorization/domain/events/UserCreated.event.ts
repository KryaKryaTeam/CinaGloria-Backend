import { Event } from 'src/common/domain/Event';
import { UserEntity } from '../entities/User.entity';
import { EventType } from 'src/common/domain/EventType';

export class UserCreated extends Event<UserEntity> {
  public EventType: EventType = EventType.USER_CREATED;
  constructor(payload: UserEntity) {
    super(payload);
  }
}
