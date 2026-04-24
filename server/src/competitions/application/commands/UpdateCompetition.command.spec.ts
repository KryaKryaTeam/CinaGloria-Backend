import { UpdateCompetitionCommand } from './UpdateCompetition.command';

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

  const user = { id: 'user-1' } as any;
  const competition = { id: 'comp-1' } as any;

  const file = { url: 'file-url' } as any;

  beforeEach(() => {
    command = new UpdateCompetitionCommand();

    (command as any).competitionRepository = competitionRepo;
    (command as any).fileRepository = fileRepo;
    (command as any).linkerService = linkerService;

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
  });
});
