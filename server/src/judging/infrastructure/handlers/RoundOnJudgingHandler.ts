import { Injectable } from '@nestjs/common';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { EventType } from 'src/common/domain/EventType';
import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';
import { Notification } from 'src/notification/domain/entities/Notification';

@Injectable()
export class RoundOnJudgingHandler {
  protected eventType: EventType;

  async implementation(payload: {
    jury: UserEntity;
    round: RoundEntity;
  }): Promise<void> {
    Notification.create({
      title: '',
    });
  }
}
