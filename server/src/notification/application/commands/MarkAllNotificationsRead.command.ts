import { Inject } from '@nestjs/common';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Command } from 'src/common/application/Command';
import { ReposTokens } from 'src/common/Tokens';
import type { INotificationRepository } from '../bounds/INotificationRepository';

interface MarkAllNotificationsReadCommandInput {
  user: UserEntity;
}

export class MarkAllNotificationsReadCommand extends Command<
  MarkAllNotificationsReadCommandInput,
  void
> {
  @Inject(ReposTokens.NotificationRepository)
  private readonly notification_repo: INotificationRepository;
  async implementation(
    data: MarkAllNotificationsReadCommandInput,
  ): Promise<void> {
    const ntf = await this.notification_repo.getAllUnreadByUserId(data.user.id);

    ntf.map((n) => n.markAsRead(data.user.id));

    await Promise.all(
      ntf.map(async (n) => await this.notification_repo.save(n)),
    );
  }
}
