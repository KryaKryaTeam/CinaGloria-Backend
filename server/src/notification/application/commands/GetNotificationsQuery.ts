import type { PropsWithUserId } from 'src/types/PropsWithUserId';
import { Query } from '../../../common/application/Query';
import { Inject, NotFoundException } from '@nestjs/common';
import { ReposTokens } from 'src/common/Tokens';
import type { INotificationRepository } from '../bounds/INotificationRepository';
import { NotificationNonPopulated } from 'src/notification/domain/entities/NotificationNonPopulated';

interface QueryData {
  page: number;
}

export class GetNotificationsQuery extends Query<
  PropsWithUserId<QueryData>,
  NotificationNonPopulated[]
> {
  @Inject(ReposTokens.NotificationRepository)
  private readonly notificationRepository: INotificationRepository;
  async implementation(
    data: PropsWithUserId<QueryData>,
  ): Promise<NotificationNonPopulated[]> {
    const notification = await this.notificationRepository.getPageByUserId(
      data.id,
      data.page,
    );

    if (!notification)
      throw new NotFoundException('Notification for this page is undefined!');

    return notification;
  }
}
