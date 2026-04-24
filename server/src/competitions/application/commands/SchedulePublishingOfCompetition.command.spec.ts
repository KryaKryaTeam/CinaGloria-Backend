import { ScheduleCompetitionPublishCommand } from './SchedulePublishingOfCompetition.command';
import { UserAndCompetitionService } from 'src/competitions/domain/services/UserAndCompetitionService';

describe('ScheduleCompetitionPublishCommand', () => {
  let command: ScheduleCompetitionPublishCommand;

  const mockRepo = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  const user = { id: 'user-1' } as any;
  const competition = { id: 'comp-1' } as any;
  const publishAt = new Date('2026-01-01T10:00:00Z');

  beforeEach(() => {
    command = new ScheduleCompetitionPublishCommand();
    (command as any).competitionRepository = mockRepo;

    jest.clearAllMocks();
  });

  it('should schedule publishing and save competition', async () => {
    mockRepo.findById.mockResolvedValue(competition);

    const spy = jest.spyOn(UserAndCompetitionService, 'schedulePublishing');

    await command.execute({
      competitionId: 'comp-1',
      user,
      publishAt,
    });

    expect(mockRepo.findById).toHaveBeenCalledWith('comp-1');

    expect(spy).toHaveBeenCalledWith(competition, publishAt, user);

    expect(mockRepo.save).toHaveBeenCalledWith(competition);
  });

  it('should throw if competition not found', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(
      command.execute({
        competitionId: 'comp-1',
        user,
        publishAt,
      }),
    ).rejects.toThrow();

    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
