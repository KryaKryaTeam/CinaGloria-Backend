import { Notification } from 'src/notification/domain/entities/Notification';
import { NotificationNonPopulated } from 'src/notification/domain/entities/NotificationNonPopulated';

export interface INotificationRepository {
  save(notification: Notification): Promise<void>;
  getAllByUserId(userId: string): Promise<null | Notification[]>;
  getPageByUserId(
    userId: string,
    page: number,
  ): Promise<null | NotificationNonPopulated[]>;
  getById(id: string): Promise<Notification | null>;
  getAllUnreadByUserId(id: string): Promise<Notification[]>;
}
