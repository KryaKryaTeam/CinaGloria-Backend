import { Injectable } from '@nestjs/common';
import { EventType } from 'src/common/domain/EventType';
import { BaseHandler } from 'src/common/infrastructure/BaseHandler';
import { Notification } from 'src/notification/domain/entities/Notification';
import { TeamEntity } from 'src/teams/domain/entities/Team.entity';

@Injectable()
export class MemberAcceptedInviteHandler extends BaseHandler {
  protected eventType: EventType = EventType.MEMBER_ACCEPT_INVITE;

  implementation(payload: { memberId: string; team: TeamEntity }): void {
    this.sendNotification(
      Notification.create({
        title: 'Invite is accepted',
        content: `User [{user}{${payload.memberId}}] has joined the team ${payload.team.name}]`,
        from: 'System',
        targets: ['ws'],
        to: { ws: payload.team.captain },
      }),
    );
  }
}
