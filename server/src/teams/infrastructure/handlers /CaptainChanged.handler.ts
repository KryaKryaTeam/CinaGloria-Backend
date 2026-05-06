import { Injectable } from '@nestjs/common';
import { EventType } from 'src/common/domain/EventType';
import { BaseHandler } from 'src/common/infrastructure/BaseHandler';
import { Notification } from 'src/notification/domain/entities/Notification';
import { TeamEntity } from 'src/teams/domain/entities/Team.entity';

@Injectable()
export class CaptainChangedHandler extends BaseHandler {
  protected eventType: EventType = EventType.CAPTAIN_CHANGED;

  implementation(payload: { captainId: string; team: TeamEntity }): void {
    payload.team.members.forEach((m) => {
      this.sendNotification(
        Notification.create({
          title: `Hey! The new captain of ${payload.team.name} is here!`,
          content: `The team captain has been updated. New captain is [{user}{${payload.captainId}}]`,
          from: 'System',
          targets: ['ws'],
          to: { ws: m }, // set id of web socket to send
        }),
      );
    });
  }
}
