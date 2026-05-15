import { PullTeamsToNextRoundCommand } from './PullTeamsToNextRound.command';
import { RoundAndCompetitionService } from 'src/competitions/domain/services/RoundAndCompetition.service';
import { CompetitionErrors, RoundErrors } from 'src/error/ApiError';

describe('PullTeamsToNextRoundCommand', () => {
  let command: PullTeamsToNextRoundCommand;

  const mockRoundRepository = {
    findRelatedCompetition: jest.fn(),
    save: jest.fn(),
  };

  const mockDBContext = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
  };

  const mockEventDispatcher = {
    dispatchEvents: jest.fn(),
  };

  beforeEach(() => {
    command = new PullTeamsToNextRoundCommand();

    (command as any).roundRepository = mockRoundRepository;
    (command as any).DBContext = mockDBContext;
    (command as any).eventDispatcher = mockEventDispatcher;

    jest.clearAllMocks();
  });

  it('should pull teams to the next round and save it', async () => {
    const team1 = {
      id: 'team-1',
    };

    const team2 = {
      id: 'team-2',
    };

    const nextRound = {
      id: 'round-2',
      addTeam: jest.fn(),
    };

    const currentRound = {
      id: 'round-1',
    };

    const competition = {
      rounds: [currentRound, nextRound],
    };

    const leaderboard = {
      round: currentRound,
    };

    mockRoundRepository.findRelatedCompetition.mockResolvedValue(competition);

    jest
      .spyOn(RoundAndCompetitionService, 'countTeamsToEnterNextRound')
      .mockReturnValue([team1, team2] as any);

    await command.execute(leaderboard as any);

    expect(mockDBContext.startTransaction).toHaveBeenCalled();

    expect(mockRoundRepository.findRelatedCompetition).toHaveBeenCalledWith(
      currentRound.id,
    );

    expect(
      RoundAndCompetitionService.countTeamsToEnterNextRound,
    ).toHaveBeenCalledWith(currentRound, competition, leaderboard);

    expect(nextRound.addTeam).toHaveBeenCalledWith(team1);
    expect(nextRound.addTeam).toHaveBeenCalledWith(team2);

    expect(mockRoundRepository.save).toHaveBeenCalledWith(nextRound);

    expect(mockDBContext.commitTransaction).toHaveBeenCalled();

    expect(mockEventDispatcher.dispatchEvents).toHaveBeenCalled();
  });

  it('should rollback transaction if implementation throws', async () => {
    const leaderboard = {
      round: {
        id: 'round-1',
      },
    };

    mockRoundRepository.findRelatedCompetition.mockResolvedValue(null);

    await expect(command.execute(leaderboard as any)).rejects.toMatchObject({
      // code: ApiErrorsCodeVal.COMPETITION_019,
      code: CompetitionErrors.COMPETITION_NOT_FOUND,
    });

    expect(mockDBContext.startTransaction).toHaveBeenCalled();

    expect(mockDBContext.rollbackTransaction).toHaveBeenCalled();

    expect(mockDBContext.commitTransaction).not.toHaveBeenCalled();

    expect(mockEventDispatcher.dispatchEvents).not.toHaveBeenCalled();
  });

  it('should throw if round is not inside competition', async () => {
    const leaderboard = {
      round: {
        id: 'missing-round',
      },
    };

    const competition = {
      rounds: [
        {
          id: 'round-1',
        },
      ],
    };

    mockRoundRepository.findRelatedCompetition.mockResolvedValue(competition);

    await expect(command.execute(leaderboard as any)).rejects.toMatchObject({
      // code: ApiErrorsCodeVal.ROUND_012,
      code: RoundErrors.ROUND_NOT_IN_COMPETITION,
    });

    expect(mockDBContext.rollbackTransaction).toHaveBeenCalled();
  });

  it('should do nothing if current round is the last round', async () => {
    const currentRound = {
      id: 'round-1',
    };

    const competition = {
      rounds: [currentRound],
    };

    const leaderboard = {
      round: currentRound,
    };

    mockRoundRepository.findRelatedCompetition.mockResolvedValue(competition);

    const serviceSpy = jest.spyOn(
      RoundAndCompetitionService,
      'countTeamsToEnterNextRound',
    );

    await command.execute(leaderboard as any);

    expect(serviceSpy).not.toHaveBeenCalled();

    expect(mockRoundRepository.save).not.toHaveBeenCalled();

    expect(mockDBContext.commitTransaction).toHaveBeenCalled();

    expect(mockEventDispatcher.dispatchEvents).toHaveBeenCalled();
  });
});
