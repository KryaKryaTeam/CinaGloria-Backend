import { UserAndCompetitionService } from 'src/competitions/domain/services/UserAndCompetitionService';
import { DeclineScheduledPublishCommand } from './DeclineScheduleOfPublishingOfCompetition.command';
import { ApiError, CompetitionErrors } from 'src/error/ApiError';

describe('DeclineScheduledPublishCommand', () => {
  let command: DeclineScheduledPublishCommand;

  const mockRepo = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  const user = { id: 'user-1' } as any;
  const competition = { id: 'comp-1' } as any;

  beforeEach(() => {
    command = new DeclineScheduledPublishCommand();

    // manually inject repo (since no Nest container here)
    (command as any).competitionRepository = mockRepo;

    jest.clearAllMocks();
  });

  it('should decline scheduled publishing and save competition', async () => {
    mockRepo.findById.mockResolvedValue(competition);

    const spy = jest.spyOn(
      UserAndCompetitionService,
      'declineSchedulePublishing',
    );

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

    const throwSpy = jest.spyOn(ApiError, 'throw');

    await expect(
      command.execute({
        user,
        competitionId: 'comp-1',
      }),
    ).rejects.toThrow();

    expect(throwSpy).toHaveBeenCalledWith(CompetitionErrors.UNDEFINED);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
