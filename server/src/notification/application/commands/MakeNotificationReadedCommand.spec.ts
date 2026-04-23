import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MakeNotificationReaded } from './MakeNotificationReadedCommand';
import { BaseTokens, ReposTokens } from 'src/common/Tokens';
import { ApiError, DomainErrors } from 'src/error/ApiError';
import { createMockEventDispatcher } from 'src/common/application/events/EventDispatcher';
import { createMockDBContext } from 'src/common/application/IDcontext.spec';

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

  const input = {
    user: { id: 'user-123' },
    notificationId: 'notif-456',
  };

  it('should successfully mark a notification as read and save it', async () => {
    // 1. Arrange: Create a mock notification entity
    const mockNotification = {
      markAsRead: jest.fn(),
    };
    mockNotificationRepo.getById.mockResolvedValue(mockNotification);

    // 2. Act
    await command.implementation(input);

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
    await expect(command.implementation(input)).rejects.toThrow(ApiError);
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
    await expect(command.implementation(input)).rejects.toThrow(ApiError);
    expect(mockNotificationRepo.save).not.toHaveBeenCalled();
  });
});
