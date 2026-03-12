import { Test, TestingModule } from '@nestjs/testing';
import { NotificationMapper } from './NotificationMapper';
import { MapperTokens } from 'src/common/Tokens';
import { Notification } from 'src/notification/domain/entities/Notification';
import { NotificationSchema } from 'src/schemas/Notification.schema';
import { NotificationStatus } from 'src/types/NotificationStatus';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { UserSchema } from 'src/schemas/User.schema';

describe('NotificationMapper', () => {
  let mapper: NotificationMapper;

  // Mock for the nested UserMapper
  const mockUserMapper = {
    toEntity: jest.fn(),
    toSchema: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationMapper,
        {
          provide: MapperTokens.UserMapper,
          useValue: mockUserMapper,
        },
      ],
    }).compile();

    mapper = module.get<NotificationMapper>(NotificationMapper);
    jest.clearAllMocks();
  });

  const mockUserEntity = { id: 'user-1' } as unknown as UserEntity;
  const mockUserSchema = {
    id: 'user-1',
    name: 'John',
  } as unknown as UserSchema;

  describe('toEntity', () => {
    it('should map a schema to a domain entity', () => {
      const schema: NotificationSchema = {
        id: 'notif-123',
        content: 'Hello World',
        from: 'system',
        status: NotificationStatus.sended,
        title: 'Welcome',
        to: mockUserSchema,
        createdAt: new Date(),
      } as NotificationSchema;

      mockUserMapper.toEntity.mockReturnValue(mockUserEntity);

      const entity = mapper.toEntity(schema);

      expect(entity).toBeInstanceOf(Notification);
      expect(entity.id).toBe(schema.id);
      expect(mockUserMapper.toEntity).toHaveBeenCalledWith(schema.to);
      expect(entity.to).toBe(mockUserEntity);
    });
  });

  describe('toSchema', () => {
    it('should map a domain entity to a schema', () => {
      const entity = Notification.load({
        id: 'notif-123',
        content: 'Hello World',
        from: 'system',
        status: NotificationStatus.sended,
        title: 'Welcome',
        to: mockUserEntity,
        targets: ['web'],
        createdAt: new Date(),
      });

      mockUserMapper.toSchema.mockReturnValue(mockUserSchema);

      const schema = mapper.toSchema(entity);

      expect(schema).toBeInstanceOf(NotificationSchema);
      expect(schema.id).toBe(entity.id);
      expect(mockUserMapper.toSchema).toHaveBeenCalledWith(entity.to);
      expect(schema.to).toBe(mockUserSchema);
    });
  });
});
