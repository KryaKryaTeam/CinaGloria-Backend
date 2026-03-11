import { INotificationRepository } from 'src/notification/application/bounds/INotificationRepository';
import { Notification } from 'src/notification/domain/entities/Notification';
import { BaseRepository } from './BaseRepository';
import { NotificationSchema } from 'src/schemas/Notification.schema';
import { Inject } from '@nestjs/common';
import { MapperTokens } from 'src/common/Tokens';
import { NotificationMapper } from 'src/notification/application/mappers/NotificationMapper';
import { NotificationNonPopulated } from 'src/notification/domain/entities/NotificationNonPopulated';

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
    const result = await this.repository.findOne({
      where: { id },
      relationLoadStrategy: 'join',
      loadEagerRelations: true,
      relations: { to: true },
    });
    if (result == null) return null;

    console.log(result);

    return this.notificationMapper.toEntity(result);
  }

  async getPageByUserId(
    userId: string,
    page: number,
  ): Promise<null | NotificationNonPopulated[]> {
    const result = await this.repository.find({
      where: { to: { id: userId } },
      skip: page * 20,
      take: 20,
      loadRelationIds: true,
    });

    if (!result || !result[0]) return null;

    return result.map((sch) =>
      NotificationNonPopulated.load({
        ...sch,
        targets: ['ws'],
        to: sch.to as unknown as string,
      }),
    );
  }
}
