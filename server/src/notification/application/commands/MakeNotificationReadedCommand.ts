import { Inject, NotFoundException } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import { ReposTokens } from 'src/common/Tokens';
import { PropsWithUserId } from 'src/types/PropsWithUserId';
import type { INotificationRepository } from '../bounds/INotificationRepository';

interface CommandInput {
  notificationId: string;
}

export class MakeNotificationReaded extends Command<
  PropsWithUserId<CommandInput>,
  void
> {
  @Inject(ReposTokens.NotificationRepository)
  private readonly notification_repo: INotificationRepository;
  async implementation(data: PropsWithUserId<CommandInput>): Promise<void> {
    const notification = await this.notification_repo.getById(
      data.notificationId,
    );

    if (!notification)
      throw new NotFoundException('Notifications with this id is undefined!');

    notification.markAsRead(data.id);

    await this.notification_repo.save(notification);
  }
}
