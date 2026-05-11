import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { UpdateCompetitionCommand } from './UpdateCompetition.command';
import { Username } from 'src/authorization/domain/objects/Username.object';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { RelationSlots } from 'src/types/RelationSlots';
import { RoleEnum } from 'src/types/RoleEnum';

describe('UpdateCompetitionCommand', () => {
  let command: UpdateCompetitionCommand;

  const competitionRepo = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  const fileRepo = {
    findByUrl: jest.fn(),
  };

  const linkerService = {
    linkFileToCompetitionSlot: jest.fn(),
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

  const file = { url: 'file-url' } as any;

  beforeEach(() => {
    command = new UpdateCompetitionCommand();

    (command as any).competitionRepository = competitionRepo;
    (command as any).fileRepository = fileRepo;
    (command as any).linkerService = linkerService;
    (command as any).DBContext = dbContextMock;
    (command as any).eventDispatcher = eventDispatcherMock;

    jest.clearAllMocks();
  });

  it('should update competition and link files', async () => {
    competitionRepo.findById.mockResolvedValue(competition);
    fileRepo.findByUrl.mockResolvedValue(file);

    const data = {
      competitionId: 'comp-1',
      user,
      competitionData: {
        avatar: 'file-url',
        banner: 'file-url',
        socialMedia: 'file-url',
        ultraWideBanner: 'file-url',
        rules: [
          {
            name: '',
            description: '',
            icon: '',
          },
        ],
      },
    };

    await command.execute(data);

    expect(competitionRepo.findById).toHaveBeenCalledWith('comp-1');

    expect(fileRepo.findByUrl).toHaveBeenCalledTimes(4);

    expect(linkerService.linkFileToCompetitionSlot).toHaveBeenCalled();

    expect(competitionRepo.save).toHaveBeenCalledWith(competition);

    expect(dbContextMock.startTransaction).toHaveBeenCalled();
    expect(dbContextMock.commitTransaction).toHaveBeenCalled();
    expect(eventDispatcherMock.dispatchEvents).toHaveBeenCalled();
  });
});
