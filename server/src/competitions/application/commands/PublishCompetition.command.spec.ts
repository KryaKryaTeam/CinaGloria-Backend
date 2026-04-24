import { PublishCompetitionCommand } from './PublishCompetition.command';
import { UserAndCompetitionService } from 'src/competitions/domain/services/UserAndCompetitionService';

describe('PublishCompetitionCommand', () => {
  let command: PublishCompetitionCommand;

  const mockRepo = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  const user = { id: 'user-1' } as any;
  const competition = { id: 'comp-1' } as any;

  beforeEach(() => {
    command = new PublishCompetitionCommand();
    (command as any).competitionRepository = mockRepo;

    jest.clearAllMocks();
  });

  it('should publish competition and save it', async () => {
    mockRepo.findById.mockResolvedValue(competition);

    const spy = jest.spyOn(UserAndCompetitionService, 'publishCompetiton');

    await command.execute({
      user,
      competitionId: 'comp-1',
    });

    expect(mockRepo.findById).toHaveBeenCalledWith('comp-1');
    expect(spy).toHaveBeenCalledWith(competition, user);
    expect(mockRepo.save).toHaveBeenCalledWith(competition);
  });

  it('should throw if competition is not found', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(
      command.execute({
        user,
        competitionId: 'comp-1',
      }),
    ).rejects.toThrow();

    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
