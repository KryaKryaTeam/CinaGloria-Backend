import { RunEndEventOnAllEndedRoundsCommand } from './RunEndEventOnAllEndedRounds.command';
import { RoundEnded } from 'src/competitions/domain/events/RoundEnded.event';

describe('RunEndEventOnAllEndedRoundsCommand', () => {
  let command: RunEndEventOnAllEndedRoundsCommand;

  const roundRepo = {
    findAllEndedButNotProcessed: jest.fn(),
    getParentCompetitionId: jest.fn(),
  };

  const competitionRepo = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  const mockEventDispatcher = {
    addEvent: jest.fn(),
    dispatchEvents: jest.fn(),
  };

  const mockDBContext = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
  };

  const round = { id: 'round-1' } as any;
  const competition = {
    id: 'comp-1',
    showNextRound: jest.fn(),
  } as any;

  beforeEach(() => {
    command = new RunEndEventOnAllEndedRoundsCommand();

    (command as any).roundRepo = roundRepo;
    (command as any).competitionRepo = competitionRepo;
    (command as any).eventDispatcher = mockEventDispatcher;
    (command as any).DBContext = mockDBContext;

    jest.clearAllMocks();
  });

  it('should process rounds and advance competition', async () => {
    roundRepo.findAllEndedButNotProcessed.mockResolvedValue([round]);
    roundRepo.getParentCompetitionId.mockResolvedValue('comp-1');
    competitionRepo.findById.mockResolvedValue(competition);

    await command.execute(undefined as any);

    expect(mockDBContext.startTransaction).toHaveBeenCalled();

    expect(roundRepo.findAllEndedButNotProcessed).toHaveBeenCalled();
    expect(roundRepo.getParentCompetitionId).toHaveBeenCalledWith(round);

    expect(competition.showNextRound).toHaveBeenCalled();
    expect(competitionRepo.save).toHaveBeenCalledWith(competition);

    expect(mockEventDispatcher.addEvent).toHaveBeenCalledWith(
      expect.any(RoundEnded),
    );

    expect(mockDBContext.commitTransaction).toHaveBeenCalled();
    expect(mockEventDispatcher.dispatchEvents).toHaveBeenCalled();
  });

  it('should skip if no competitionId', async () => {
    roundRepo.findAllEndedButNotProcessed.mockResolvedValue([round]);
    roundRepo.getParentCompetitionId.mockResolvedValue(null);

    await command.execute(undefined as any);

    expect(competitionRepo.findById).not.toHaveBeenCalled();
    expect(competitionRepo.save).not.toHaveBeenCalled();

    expect(mockDBContext.commitTransaction).toHaveBeenCalled();
    expect(mockEventDispatcher.dispatchEvents).toHaveBeenCalled();
  });

  it('should skip if competition not found', async () => {
    roundRepo.findAllEndedButNotProcessed.mockResolvedValue([round]);
    roundRepo.getParentCompetitionId.mockResolvedValue('comp-1');
    competitionRepo.findById.mockResolvedValue(null);

    await command.execute(undefined as any);

    expect(competitionRepo.save).not.toHaveBeenCalled();

    expect(mockDBContext.commitTransaction).toHaveBeenCalled();
    expect(mockEventDispatcher.dispatchEvents).toHaveBeenCalled();
  });

  it('should emit event for each round', async () => {
    const r1 = { id: 'r1' };
    const r2 = { id: 'r2' };

    roundRepo.findAllEndedButNotProcessed.mockResolvedValue([r1, r2]);
    roundRepo.getParentCompetitionId.mockResolvedValue(null);

    await command.execute(undefined as any);

    expect(mockEventDispatcher.addEvent).toHaveBeenCalledTimes(2);
    expect(mockEventDispatcher.addEvent).toHaveBeenCalledWith(
      expect.any(RoundEnded),
    );
  });

  it('should rollback on error', async () => {
    roundRepo.findAllEndedButNotProcessed.mockRejectedValue(new Error('boom'));

    await expect(command.execute(undefined as any)).rejects.toThrow('boom');

    expect(mockDBContext.startTransaction).toHaveBeenCalled();
    expect(mockDBContext.rollbackTransaction).toHaveBeenCalled();

    expect(mockDBContext.commitTransaction).not.toHaveBeenCalled();
    expect(mockEventDispatcher.dispatchEvents).not.toHaveBeenCalled();
  });
});
