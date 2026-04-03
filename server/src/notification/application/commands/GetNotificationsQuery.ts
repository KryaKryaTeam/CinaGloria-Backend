import type { PropsWithUserId } from 'src/types/PropsWithUserId';
import { Query } from '../../../common/application/Query';
import { Inject } from '@nestjs/common';
import { ReposTokens } from 'src/common/Tokens';
import type { INotificationRepository } from '../bounds/INotificationRepository';
import { NotificationNonPopulated } from 'src/notification/domain/entities/NotificationNonPopulated';
import { ApiError, CommonErrors } from 'src/error/ApiError';

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

    if (!notification) ApiError.throw(CommonErrors.PAGE_IS_EMPTY);

    return notification;
  }
}
