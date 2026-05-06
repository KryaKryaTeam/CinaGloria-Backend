import { Injectable } from '@nestjs/common';
import { EventType } from 'src/common/domain/EventType';
import { BaseHandler } from 'src/common/infrastructure/BaseHandler';
import { Notification } from 'src/notification/domain/entities/Notification';
import { TeamEntity } from 'src/teams/domain/entities/Team.entity';

@Injectable()
export class MemberDeletedHandler extends BaseHandler {
  protected eventType: EventType = EventType.MEMBER_DELETED;

  implementation(payload: { memberId: string; team: TeamEntity }): void {
    payload.team.members.forEach((m) =>
      this.sendNotification(
        Notification.create({
          title: 'Say bye!',
          content: `User [{user}{${payload.memberId}}] has exited from ${payload.team.name}`,
          from: 'System',
          targets: ['ws'],
          to: { ws: m },
        }),
      ),
    );
  }
}
