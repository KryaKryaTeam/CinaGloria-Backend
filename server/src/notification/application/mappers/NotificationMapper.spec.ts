import { Test, TestingModule } from '@nestjs/testing';
import { NotificationMapper } from './NotificationMapper';
import { Notification } from 'src/notification/domain/entities/Notification';
import { NotificationSchema } from 'src/schemas/Notification.schema';
import { NotificationStatus } from 'src/types/NotificationStatus';

describe('NotificationMapper', () => {
  let mapper: NotificationMapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationMapper],
    }).compile();

    mapper = module.get<NotificationMapper>(NotificationMapper);
  });

  const mockDate = new Date();
  const userId = 'user-uuid-123';
  const userEmail = 'test@example.com';

  describe('toEntity', () => {
    it('should map a schema to a domain entity using toId and toEmail', () => {
      const schema = {
        id: 'notif-1',
        content: 'Hello World',
        from: 'system',
        status: NotificationStatus.sended,
        title: 'Welcome',
        toId: userId,
        toEmail: userEmail,
        createdAt: mockDate,
      } as NotificationSchema;

      const entity = mapper.toEntity(schema);

      expect(entity).toBeInstanceOf(Notification);
      expect(entity.id).toBe(schema.id);
      expect(entity.title).toBe(schema.title);

      expect(entity.to).toEqual({
        ws: userId,
        email: userEmail,
      });
    });
  });

  describe('toSchema', () => {
    it('should map a domain entity to a schema with flat toId and toEmail columns', () => {
      const entity = Notification.load({
        id: 'notif-1',
        content: 'Hello World',
        from: 'system',
        status: NotificationStatus.sended,
        title: 'Welcome',
        to: { ws: userId, email: userEmail },
        targets: ['web'],
        createdAt: mockDate,
      });

      const schema = mapper.toSchema(entity);

      expect(schema).toBeInstanceOf(NotificationSchema);
      expect(schema.id).toBe(entity.id);

      expect(schema.toId).toBe(userId);
      expect(schema.toEmail).toBe(userEmail);

      expect(schema.status).toBe(entity.status);
    });
  });
});
