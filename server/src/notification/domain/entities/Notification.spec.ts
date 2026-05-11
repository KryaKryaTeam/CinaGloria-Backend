import { Notification } from './Notification'; // Adjust the path as needed
import { NotificationStatus } from 'src/types/NotificationStatus';
import { ApiError } from 'src/error/ApiError';

describe('Notification Entity', () => {
  // Mock User helper

  const validProps = {
    title: 'Valid Title',
    content: 'This is the notification content.',
    from: 'System',
    to: { ws: 'user-123', email: 'example@localhost.com' },
    targets: ['web', 'email'],
  };

  describe('create', () => {
    it('should create a new notification with valid data', () => {
      const notification = Notification.create(validProps);

      expect(notification.id).toBeDefined();
      expect(notification.title).toBe(validProps.title);
      expect(notification.status).toBe(NotificationStatus.sended);
      expect(notification.createdAt).toBeInstanceOf(Date);
    });

    it('should throw an error if the title is too short', () => {
      const shortTitle = { ...validProps, title: 'No' };

      expect(() => Notification.create(shortTitle)).toThrow(ApiError);
    });

    it('should throw an error if the title is too long', () => {
      const longTitle = { ...validProps, title: 'a'.repeat(101) };

      expect(() => Notification.create(longTitle)).toThrow(ApiError);
    });
  });

  describe('markAsRead', () => {
    it('should change status to readed when called by the owner', () => {
      const notification = Notification.create(validProps);

      notification.markAsRead('user-123');

      expect(notification.status).toBe(NotificationStatus.readed);
    });

    it('should throw an error if someone other than the recipient tries to mark as read', () => {
      const notification = Notification.create(validProps);

      expect(() => notification.markAsRead('wrong-user-id')).toThrow(ApiError);
    });

    it('should do nothing (stay readed) if already readed (idempotency)', () => {
      const notification = Notification.create(validProps);

      notification.markAsRead('user-123');
      expect(notification.status).toBe(NotificationStatus.readed);

      // Call it again
      notification.markAsRead('user-123');
      expect(notification.status).toBe(NotificationStatus.readed);
    });
  });

  describe('load', () => {
    it('should restore an entity from existing data', () => {
      const existingDate = new Date();
      const notification = Notification.load({
        id: 'existing-uuid',
        ...validProps,
        status: NotificationStatus.readed,
        createdAt: existingDate,
      });

      expect(notification.id).toBe('existing-uuid');
      expect(notification.status).toBe(NotificationStatus.readed);
      expect(notification.createdAt).toBe(existingDate);
    });
  });
});
