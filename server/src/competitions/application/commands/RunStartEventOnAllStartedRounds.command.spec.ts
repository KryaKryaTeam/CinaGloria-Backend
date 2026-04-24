import { RunStartEventOnAllStartedRoundsCommand } from './RunStartEventOnAllStartedRounds.command';
import { RoundStarted } from 'src/competitions/domain/events/RoundStarted.event';
import { RoundStatus } from 'src/types/RoundStatus';

describe('RunStartEventOnAllStartedRoundsCommand', () => {
  let command: RunStartEventOnAllStartedRoundsCommand;

  const roundRepository = {
    findAllStartedButNotProcessed: jest.fn(),
    save: jest.fn(),
  };

  const round = {
    id: 'round-1',
    status: RoundStatus.CREATED,
  } as any;

  beforeEach(() => {
    command = new RunStartEventOnAllStartedRoundsCommand();

    (command as any).roundRepository = roundRepository;
    (command as any).eventDispatcher = {
      addEvent: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it('should start rounds, emit event and save changes', async () => {
    roundRepository.findAllStartedButNotProcessed.mockResolvedValue([round]);

    await command.execute();

    expect(roundRepository.findAllStartedButNotProcessed).toHaveBeenCalled();

    expect((command as any).eventDispatcher.addEvent).toHaveBeenCalledWith(
      expect.any(RoundStarted),
    );

    expect(round.status).toBe(RoundStatus.IN_PROGRESS);

    expect(roundRepository.save).toHaveBeenCalledWith(round);
  });

  it('should process multiple rounds in parallel', async () => {
    const r1 = { id: 'r1', status: RoundStatus.CREATED };
    const r2 = { id: 'r2', status: RoundStatus.CREATED };

    roundRepository.findAllStartedButNotProcessed.mockResolvedValue([r1, r2]);

    await command.execute();

    expect(roundRepository.save).toHaveBeenCalledTimes(2);
    expect(r1.status).toBe(RoundStatus.IN_PROGRESS);
    expect(r2.status).toBe(RoundStatus.IN_PROGRESS);
  });

  it('should emit event for each round', async () => {
    const r1 = { id: 'r1', status: RoundStatus.CREATED };
    const r2 = { id: 'r2', status: RoundStatus.CREATED };

    roundRepository.findAllStartedButNotProcessed.mockResolvedValue([r1, r2]);

    const dispatcher = (command as any).eventDispatcher;

    await command.execute();

    expect(dispatcher.addEvent).toHaveBeenCalledTimes(2);
    expect(dispatcher.addEvent).toHaveBeenCalledWith(expect.any(RoundStarted));
  });

  it('should do nothing when no rounds exist', async () => {
    roundRepository.findAllStartedButNotProcessed.mockResolvedValue([]);

    await command.execute();

    expect(roundRepository.save).not.toHaveBeenCalled();
    expect((command as any).eventDispatcher.addEvent).not.toHaveBeenCalled();
  });
});
