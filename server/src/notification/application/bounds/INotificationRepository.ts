import { Notification } from 'src/notification/domain/entities/Notification';

export interface INotificationRepository {
  save(notification: Notification): Promise<void>;
  getAllByUserId(userId: string): Promise<null | Notification[]>;
  getById(id: string): Promise<Notification | null>;
}
