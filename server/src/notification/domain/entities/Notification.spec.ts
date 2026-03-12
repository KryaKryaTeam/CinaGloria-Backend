import { Notification } from './Notification'; // Adjust the path as needed
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { NotificationStatus } from 'src/types/NotificationStatus';
import { DomainError, DomainErrors } from 'src/error/DomainError';

describe('Notification Entity', () => {
  // Mock User helper
  const makeUser = (id: string) => ({ id }) as UserEntity;

  const validProps = {
    title: 'Valid Title',
    content: 'This is the notification content.',
    from: 'System',
    to: makeUser('user-123'),
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

      expect(() => Notification.create(shortTitle)).toThrow(
        new DomainError(DomainErrors.UNEXPECTED_VALUE),
      );
    });

    it('should throw an error if the title is too long', () => {
      const longTitle = { ...validProps, title: 'a'.repeat(101) };

      expect(() => Notification.create(longTitle)).toThrow(
        new DomainError(DomainErrors.UNEXPECTED_VALUE),
      );
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

      expect(() => notification.markAsRead('wrong-user-id')).toThrow(
        new DomainError(DomainErrors.RESTRICTED_CHANGE),
      );
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
