import { Notification } from 'src/notification/domain/entities/Notification';

export interface INotificationService {
  sendNotification(notification: Notification): Promise<void>;
  getAvalibleTargets(): string[];
}
