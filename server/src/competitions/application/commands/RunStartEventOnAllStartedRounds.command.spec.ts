import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';
import { RunStartEventOnAllStartedRoundsCommand } from './RunStartEventOnAllStartedRounds.command';
import { RoundStarted } from 'src/competitions/domain/events/RoundStarted.event';
import { RoundStatus } from 'src/types/RoundStatus';
import { randomUUID } from 'crypto';
import { Icons } from 'src/types/Icons';
import { Test, TestingModule } from '@nestjs/testing';
import { BaseTokens, CommandTokens, ReposTokens } from 'src/common/Tokens';

describe('RunStartEventOnAllStartedRoundsCommand', () => {
  let command: RunStartEventOnAllStartedRoundsCommand;

  const roundRepository = {
    findAllStartedButNotProcessed: jest.fn(),
    save: jest.fn(),
  };

  const mockDBContext = {
    startTransaction: jest.fn().mockResolvedValue(undefined),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    rollbackTransaction: jest.fn().mockResolvedValue(undefined),
  };

  const mockEventDispatcher = {
    addEvent: jest.fn(),
    dispatchEvents: jest.fn(),
  };

  const round = RoundEntity.load({
    id: randomUUID(),
    name: 'test',
    description: 'tst',
    icon: Icons.BOOK,
    startOfRound: new Date(Date.now() + 1000000),
    taskTimeout: new Date(Date.now() + 2000000),
    endOfRound: new Date(Date.now() + 3000000),
    relatedTasks: [],
    hidden: false,
    status: RoundStatus.CREATED,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CommandTokens.RunStartedEventOnAllStartedRoundsCommand,
          useClass: RunStartEventOnAllStartedRoundsCommand,
        },
        { provide: BaseTokens.DBContext, useValue: mockDBContext },
        {
          provide: BaseTokens.EventDispatcher,
          useValue: mockEventDispatcher,
        },
        {
          provide: ReposTokens.RoundRepository,
          useValue: roundRepository,
        },
      ],
    }).compile();

    command = module.get(
      CommandTokens.RunStartedEventOnAllStartedRoundsCommand,
    );

    jest.clearAllMocks();
  });

  it('should start rounds, emit event and save changes', async () => {
    roundRepository.findAllStartedButNotProcessed.mockResolvedValue([round]);

    await command.execute();

    expect(roundRepository.findAllStartedButNotProcessed).toHaveBeenCalled();

    expect(mockEventDispatcher.addEvent).toHaveBeenCalledWith(
      expect.any(RoundStarted),
    );

    expect(round.status).toBe(RoundStatus.IN_PROGRESS);

    expect(roundRepository.save).toHaveBeenCalledWith(round);

    expect(mockDBContext.startTransaction).toHaveBeenCalled();
    expect(mockDBContext.commitTransaction).toHaveBeenCalled();
  });

  it('should process multiple rounds in parallel', async () => {
    const base = {
      description: 'aa',
      icon: Icons.BOOK,
      startOfRound: new Date(Date.now()),
      taskTimeout: new Date(Date.now() + 1),
      endOfRound: new Date(Date.now() + 2),
      relatedTasks: [],
      hidden: false,
      status: RoundStatus.CREATED,
    };
    const r1 = RoundEntity.load({
      id: 'r1',
      name: 'r1',
      ...base,
    });

    const r2 = RoundEntity.load({
      id: 'r2',
      name: 'r2',
      ...base,
    });

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

    await command.execute();

    expect(mockEventDispatcher.addEvent).toHaveBeenCalledTimes(2);
    expect(mockEventDispatcher.addEvent).toHaveBeenCalledWith(
      expect.any(RoundStarted),
    );
  });

  it('should do nothing when no rounds exist', async () => {
    roundRepository.findAllStartedButNotProcessed.mockResolvedValue([]);

    await command.execute();

    expect(roundRepository.save).not.toHaveBeenCalled();
    expect(mockEventDispatcher.addEvent).not.toHaveBeenCalled();
  });
});
