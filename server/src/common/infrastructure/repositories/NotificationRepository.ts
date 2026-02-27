import { INotificationRepository } from 'src/notification/application/bounds/INotificationRepository';
import { Notification } from 'src/notification/domain/entities/Notification';
import { BaseRepository } from './BaseRepository';
import { NotificationSchema } from 'src/schemas/Notification.schema';
import { Inject } from '@nestjs/common';
import { MapperTokens } from 'src/common/Tokens';
import { NotificationMapper } from 'src/notification/application/mappers/NotificationMapper';

export class NotificationRepository
  extends BaseRepository<NotificationSchema>
  implements INotificationRepository
{
  protected _entitySchema: new () => NotificationSchema = NotificationSchema;

  @Inject(MapperTokens.NotificationMapper)
  notificationMapper: NotificationMapper;

  async save(notification: Notification): Promise<void> {
    await this.repository.save(this.notificationMapper.toSchema(notification));
  }
  async getAllByUserId(userId: string): Promise<null | Notification[]> {
    const result = await this.repository
      .createQueryBuilder('notify')
      .where('notify.toId == :id', { id: userId })
      .getMany();

    if (result == null) return null;

    return result.map((el) => this.notificationMapper.toEntity(el));
  }
  async getById(id: string): Promise<Notification | null> {
    const result = await this.repository.findOne({ where: { id } });
    if (result == null) return null;

    return this.notificationMapper.toEntity(result);
  }
}
