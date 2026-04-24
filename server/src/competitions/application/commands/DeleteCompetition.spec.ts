import { DeleteCompetitionCommand } from './DeleteCompetition';
import { UserAndCompetitionService } from 'src/competitions/domain/services/UserAndCompetitionService';
import { CompetitionErrors, ApiError } from 'src/error/ApiError';

describe('DeleteCompetitionCommand', () => {
  let command: DeleteCompetitionCommand;

  const mockRepo = {
    findById: jest.fn(),
    deleteById: jest.fn(),
  };

  const user = { id: 'user-1' } as any;
  const competition = { id: 'comp-1' } as any;

  beforeEach(() => {
    command = new DeleteCompetitionCommand();
    (command as any).competitionRepository = mockRepo;

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
  });
});
