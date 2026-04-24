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

  const round = { id: 'round-1' } as any;
  const competition = {
    id: 'comp-1',
    showNextRound: jest.fn(),
  } as any;

  beforeEach(() => {
    command = new RunEndEventOnAllEndedRoundsCommand();

    (command as any).roundRepo = roundRepo;
    (command as any).competitionRepo = competitionRepo;
    (command as any).eventDispatcher = {
      addEvent: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it('should process rounds and advance competition', async () => {
    roundRepo.findAllEndedButNotProcessed.mockResolvedValue([round]);
    roundRepo.getParentCompetitionId.mockResolvedValue('comp-1');
    competitionRepo.findById.mockResolvedValue(competition);

    await command.execute();

    expect(roundRepo.findAllEndedButNotProcessed).toHaveBeenCalled();
    expect(roundRepo.getParentCompetitionId).toHaveBeenCalledWith(round);

    expect(competition.showNextRound).toHaveBeenCalled();
    expect(competitionRepo.save).toHaveBeenCalledWith(competition);

    expect((command as any).eventDispatcher.addEvent).toHaveBeenCalledWith(
      expect.any(RoundEnded),
    );
  });

  it('should skip if no competitionId', async () => {
    roundRepo.findAllEndedButNotProcessed.mockResolvedValue([round]);
    roundRepo.getParentCompetitionId.mockResolvedValue(null);

    await command.execute();

    expect(competitionRepo.findById).not.toHaveBeenCalled();
    expect(competitionRepo.save).not.toHaveBeenCalled();
  });

  it('should skip if competition not found', async () => {
    roundRepo.findAllEndedButNotProcessed.mockResolvedValue([round]);
    roundRepo.getParentCompetitionId.mockResolvedValue('comp-1');
    competitionRepo.findById.mockResolvedValue(null);

    await command.execute();

    expect(competitionRepo.save).not.toHaveBeenCalled();
  });

  it('should emit event for each round', async () => {
    const r1 = { id: 'r1' };
    const r2 = { id: 'r2' };

    roundRepo.findAllEndedButNotProcessed.mockResolvedValue([r1, r2]);
    roundRepo.getParentCompetitionId.mockResolvedValue(null);

    const dispatcher = (command as any).eventDispatcher;

    await command.execute();

    expect(dispatcher.addEvent).toHaveBeenCalledTimes(2);
    expect(dispatcher.addEvent).toHaveBeenCalledWith(expect.any(RoundEnded));
  });
});
