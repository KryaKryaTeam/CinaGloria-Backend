import { NotificationNonPopulated } from './NotificationNonPopulated'; // Adjust path
import { NotificationStatus } from 'src/types/NotificationStatus';

describe('NotificationNonPopulated', () => {
  const mockDate = new Date();

  const mockData = {
    id: 'uuid-123',
    title: 'System Update',
    content: 'The server will restart in 5 minutes.',
    from: 'admin-system',
    to: 'user-456',
    status: NotificationStatus.sended,
    targets: ['push', 'email'],
    createdAt: mockDate,
  };

  describe('load', () => {
    it('should correctly instantiate the class from an INotification object', () => {
      const result = NotificationNonPopulated.load(mockData);

      expect(result).toBeInstanceOf(NotificationNonPopulated);
      expect(result.id).toBe(mockData.id);
      expect(result.title).toBe(mockData.title);
      expect(result.content).toBe(mockData.content);
      expect(result.from).toBe(mockData.from);
      expect(result.to).toBe(mockData.to);
      expect(result.status).toBe(mockData.status);
      expect(result.createdAt).toBe(mockData.createdAt);
    });

    it('should ensure all loaded properties are read-only (runtime check)', () => {
      const result = NotificationNonPopulated.load(mockData);

      expect(Object.isFrozen(result)).toBe(false);
      expect(result.id).toBe('uuid-123');
    });
  });
});
