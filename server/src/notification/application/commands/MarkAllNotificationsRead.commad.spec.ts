import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Username } from 'src/authorization/domain/objects/Username.object';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { MarkAllNotificationsReadCommand } from 'src/notification/application/commands/MarkAllNotificationsRead.command';
import { RelationSlots } from 'src/types/RelationSlots';

describe('MarkAllNotificationsReadCommand', () => {
  let command: MarkAllNotificationsReadCommand;

  const repo = {
    getAllUnreadByUserId: jest.fn(),
    save: jest.fn(),
  };

  const dbContextMock = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
  };

  const eventDispatcherMock = {
    dispatchEvents: jest.fn(),
  };

  const user = UserEntity.create(
    'test@mail.com',
    Username.create('valid_user_123'),
    InternalFile.define<typeof RelationSlots.user.avatar>(
      'avatar.png',
      'user:avatar',
      'user:avatar',
    ),
  );

  beforeEach(() => {
    jest.clearAllMocks();

    command = new MarkAllNotificationsReadCommand();

    // manual DI injection (since Nest container is not used in unit tests)
    (command as any).notification_repo = repo;
    (command as any).DBContext = dbContextMock;
    (command as any).eventDispatcher = eventDispatcherMock;
  });

  it('should mark all notifications as read and save them', async () => {
    const notifications = [
      { markAsRead: jest.fn() },
      { markAsRead: jest.fn() },
    ];

    repo.getAllUnreadByUserId.mockResolvedValue(notifications);
    repo.save.mockResolvedValue(undefined);

    await command.execute({ user });

    // each notification marked as read
    expect(notifications[0].markAsRead).toHaveBeenCalledWith(user.id);
    expect(notifications[1].markAsRead).toHaveBeenCalledWith(user.id);

    // each notification saved
    expect(repo.save).toHaveBeenCalledTimes(2);
    expect(repo.save).toHaveBeenCalledWith(notifications[0]);
    expect(repo.save).toHaveBeenCalledWith(notifications[1]);
  });

  it('should do nothing when no unread notifications exist', async () => {
    repo.getAllUnreadByUserId.mockResolvedValue([]);

    await command.execute({ user });

    expect(repo.save).not.toHaveBeenCalled();
  });
});
