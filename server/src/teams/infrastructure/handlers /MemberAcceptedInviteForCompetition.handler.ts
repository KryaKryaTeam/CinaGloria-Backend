import { Injectable } from '@nestjs/common';
import { EventType } from 'src/common/domain/EventType';
import { BaseHandler } from 'src/common/infrastructure/BaseHandler';
import { Notification } from 'src/notification/domain/entities/Notification';
import { TeamEntity } from 'src/teams/domain/entities/Team.entity';

@Injectable()
export class MemberAcceptedInviteForCompetitionHandler extends BaseHandler {
  protected eventType: EventType =
    EventType.MEMBER_ACCEPT_INVITE_FOR_COMPETITION;

  implementation(payload: { memberId: string; team: TeamEntity }): void {
    this.sendNotification(
      Notification.create({
        title: 'Invite for competition is accepted',
        content: `User [{user}{${payload.memberId}}] has accepted invite for a competition in ${payload.team.name}`,
        from: 'System',
        targets: ['ws'],
        to: { ws: payload.team.captain },
      }),
    );
  }
}
