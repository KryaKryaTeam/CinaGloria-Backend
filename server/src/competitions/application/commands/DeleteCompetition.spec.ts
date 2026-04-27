import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { DeleteCompetitionCommand } from './DeleteCompetition';
import { UserAndCompetitionService } from 'src/competitions/domain/services/UserAndCompetitionService';
import { Username } from 'src/authorization/domain/objects/Username.object';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { RelationSlots } from 'src/types/RelationSlots';
import { RoleEnum } from 'src/types/RoleEnum';

describe('DeleteCompetitionCommand', () => {
  let command: DeleteCompetitionCommand;

  const mockRepo = {
    findById: jest.fn(),
    deleteById: jest.fn(),
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

  user.__forceSetRole(RoleEnum.ADMIN);

  const competition = { id: 'comp-1' } as any;

  beforeEach(() => {
    command = new DeleteCompetitionCommand();
    (command as any).competitionRepository = mockRepo;
    (command as any).DBContext = dbContextMock;
    (command as any).eventDispatcher = eventDispatcherMock;

    jest.clearAllMocks();
  });

  it('should delete competition', async () => {
    mockRepo.findById.mockResolvedValue(competition);

    const spy = jest.spyOn(UserAndCompetitionService, 'deleteCompetition');

    await command.execute({
      user,
      competitionId: 'comp-1',
    });

    expect(mockRepo.findById).toHaveBeenCalledWith('comp-1');
    expect(spy).toHaveBeenCalledWith(competition, user);
    expect(mockRepo.deleteById).toHaveBeenCalledWith('comp-1');

    expect(dbContextMock.startTransaction).toHaveBeenCalled();
    expect(dbContextMock.commitTransaction).toHaveBeenCalled();
    expect(eventDispatcherMock.dispatchEvents).toHaveBeenCalled();
  });

  it('should throw if competition not found', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(
      command.execute({
        user,
        competitionId: 'comp-1',
      }),
    ).rejects.toThrow();

    expect(mockRepo.deleteById).not.toHaveBeenCalled();
    expect(dbContextMock.rollbackTransaction).toHaveBeenCalled();
  });
});
