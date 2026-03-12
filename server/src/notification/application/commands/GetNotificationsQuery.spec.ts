import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetNotificationsQuery } from './GetNotificationsQuery';
import { BaseTokens, ReposTokens } from 'src/common/Tokens';
import { NotificationNonPopulated } from 'src/notification/domain/entities/NotificationNonPopulated';
import { NotificationStatus } from 'src/types/NotificationStatus';
import { createMockEventDispatcher } from 'src/common/application/events/EventDispatcher';
import { createMockDBContext } from 'src/common/application/IDcontext.spec';

describe('GetNotificationsQuery', () => {
  let query: GetNotificationsQuery;

  // Mock Repository
  const mockNotificationRepo = {
    getPageByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetNotificationsQuery,
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

    query = module.get<GetNotificationsQuery>(GetNotificationsQuery);
    jest.clearAllMocks();
  });

  const input = {
    id: 'user-123', // From PropsWithUserId
    page: 1,
  };

  it('should return an array of non-populated notifications', async () => {
    // Arrange: Create some mock non-populated entities
    const mockNotifications = [
      NotificationNonPopulated.load({
        id: 'n1',
        title: 'Title 1',
        content: 'Content 1',
        from: 'System',
        to: 'user-123',
        status: NotificationStatus.sended,
        targets: [],
        createdAt: new Date(),
      }),
    ];
    mockNotificationRepo.getPageByUserId.mockResolvedValue(mockNotifications);

    // Act
    const result = await query.implementation(input);

    // Assert
    expect(mockNotificationRepo.getPageByUserId).toHaveBeenCalledWith(
      input.id,
      input.page,
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(NotificationNonPopulated);
  });

  it('should throw NotFoundException if repository returns null/undefined', async () => {
    // Arrange
    mockNotificationRepo.getPageByUserId.mockResolvedValue(null);

    // Act & Assert
    await expect(query.implementation(input)).rejects.toThrow(
      new NotFoundException('Notification for this page is undefined!'),
    );
  });

  it('should return an empty array if the repository returns an empty array (if not treated as error)', async () => {
    mockNotificationRepo.getPageByUserId.mockResolvedValue([]);

    const result = await query.implementation(input);

    expect(result).toEqual([]);
  });
});
