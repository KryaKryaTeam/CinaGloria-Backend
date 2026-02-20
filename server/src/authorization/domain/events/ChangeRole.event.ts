import { Event } from 'src/common/domain/Event';
import { UserEntity } from '../entities/User.entity';
import { RoleEnum } from 'src/types/RoleEnum';
import { EventType } from 'src/common/domain/EventType';

interface payload {
  requester: UserEntity;
  target: UserEntity;
  role: RoleEnum;
}

export class ChangeRoleEvent extends Event<payload> {
  public EventType: EventType = EventType.CHANGE_ROLE;
  constructor(payload: payload) {
    super(payload);
  }
}
