import { Injectable } from '@nestjs/common';
import { EventType } from 'src/common/domain/EventType';
import { BaseHandler } from 'src/common/infrastructure/BaseHandler';
import { Notification } from 'src/notification/domain/entities/Notification';
import { TeamEntity } from 'src/teams/domain/entities/Team.entity';

@Injectable()
export class MemberInvitedForCompetitionHandler extends BaseHandler {
  protected eventType: EventType = EventType.MEMBER_INVITED_FOR_COMPETITION;

  implementation(payload: { memberId: string; team: TeamEntity }): void {
    this.sendNotification(
      Notification.create({
        title: 'Hey, you have new invite!',
        content: `Team ${payload.team.name} invites you to join [{invite}{${payload.team.id}}]`,
        from: 'System',
        targets: ['ws'],
        to: { ws: payload.memberId },
      }),
    );
  }
}
