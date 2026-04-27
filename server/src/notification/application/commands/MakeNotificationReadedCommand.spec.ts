import { Test, TestingModule } from '@nestjs/testing';
import { MakeNotificationReaded } from './MakeNotificationReadedCommand';
import { BaseTokens, ReposTokens } from 'src/common/Tokens';
import { ApiError, DomainErrors } from 'src/error/ApiError';
import { createMockEventDispatcher } from 'src/common/application/events/EventDispatcher';
import { createMockDBContext } from 'src/common/application/IDcontext.spec';
import { Username } from 'src/authorization/domain/objects/Username.object';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { RelationSlots } from 'src/types/RelationSlots';
import { RoleEnum } from 'src/types/RoleEnum';

describe('MakeNotificationReaded', () => {
  let command: MakeNotificationReaded;

  // Mock Repository
  const mockNotificationRepo = {
    getById: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MakeNotificationReaded,
        {
          provide: ReposTokens.NotificationRepository,
          useValue: mockNotificationRepo,
        },
        {
          provide: BaseTokens.EventDispatcher,
          useValue: createMockEventDispatcher(),
        },
        {
          provide: BaseTokens.DBContext,
          useValue: createMockDBContext(),
        },
      ],
    }).compile();

    command = module.get(MakeNotificationReaded);
    jest.clearAllMocks();
  });

  const user = UserEntity.create(
    'test@mail.com',
    Username.create('valid_user_123'),
    InternalFile.define<typeof RelationSlots.user.avatar>(
      'avatar.png',
      'user:avatar',
      'user:avatar',
    ),
  );
  user.__forceSetRole(RoleEnum.ADMIN);

  const input = {
    user,
    notificationId: 'notif-456',
  };

  it('should successfully mark a notification as read and save it', async () => {
    // 1. Arrange: Create a mock notification entity
    const mockNotification = {
      markAsRead: jest.fn(),
    };
    mockNotificationRepo.getById.mockResolvedValue(mockNotification);

    // 2. Act
    await command.execute(input);

    // 3. Assert
    expect(mockNotificationRepo.getById).toHaveBeenCalledWith(
      input.notificationId,
    );
    expect(mockNotification.markAsRead).toHaveBeenCalledWith(input.user.id);
    expect(mockNotificationRepo.save).toHaveBeenCalledWith(mockNotification);
  });

  it('should throw NotFoundException if notification does not exist', async () => {
    // Arrange
    mockNotificationRepo.getById.mockResolvedValue(null);

    // Act & Assert
    await expect(command.execute(input)).rejects.toThrow(ApiError);
    expect(mockNotificationRepo.save).not.toHaveBeenCalled();
  });

  it('should propagate DomainErrors from the entity', async () => {
    // Arrange: Mock entity that throws a Restricted Change error
    const mockNotification = {
      markAsRead: jest.fn().mockImplementation(() => {
        ApiError.throw(DomainErrors.RESTRICTED_CHANGE);
      }),
    };
    mockNotificationRepo.getById.mockResolvedValue(mockNotification);

    // Act & Assert
    await expect(command.execute(input)).rejects.toThrow(ApiError);
    expect(mockNotificationRepo.save).not.toHaveBeenCalled();
  });
});
