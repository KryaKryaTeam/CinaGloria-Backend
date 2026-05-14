import { Test, TestingModule } from '@nestjs/testing';
import { GetLeaderboardCommand } from './GetLeaderboard.command';
import { BaseTokens, ReposTokens } from 'src/common/Tokens';

describe('GetLeaderboardCommand', () => {
  let command: GetLeaderboardCommand;

  const DBContextMock = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
  };

  const eventDispatcherMock = {
    dispatchEvents: jest.fn(),
  };

  const roundRepositoryMock = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetLeaderboardCommand,

        {
          provide: BaseTokens.DBContext,
          useValue: DBContextMock,
        },

        {
          provide: BaseTokens.EventDispatcher,
          useValue: eventDispatcherMock,
        },

        {
          provide: ReposTokens.RoundRepository,
          useValue: roundRepositoryMock,
        },
      ],
    }).compile();

    command = module.get(GetLeaderboardCommand);
  });

  it('should return leaderboard successfully', async () => {
    const leaderboard = {
      id: 'leaderboard-id',
      nodes: [],
    };

    const round = {
      id: 'round-id',
      leaderboard,
    };

    roundRepositoryMock.findById.mockResolvedValue(round);

    const result = await command.execute('round-id');

    expect(DBContextMock.startTransaction).toHaveBeenCalled();

    expect(DBContextMock.commitTransaction).toHaveBeenCalled();

    expect(eventDispatcherMock.dispatchEvents).toHaveBeenCalled();

    expect(roundRepositoryMock.findById).toHaveBeenCalledWith('round-id');

    expect(result).toBe(leaderboard);
  });

  it('should rollback transaction if round does not exist', async () => {
    roundRepositoryMock.findById.mockResolvedValue(undefined);

    await expect(command.execute('missing-round')).rejects.toThrow();

    expect(DBContextMock.startTransaction).toHaveBeenCalled();

    expect(DBContextMock.rollbackTransaction).toHaveBeenCalled();

    expect(DBContextMock.commitTransaction).not.toHaveBeenCalled();
  });

  it('should rollback transaction if leaderboard does not exist', async () => {
    const round = {
      id: 'round-id',
      leaderboard: undefined,
    };

    roundRepositoryMock.findById.mockResolvedValue(round);

    await expect(command.execute('round-id')).rejects.toThrow();

    expect(DBContextMock.startTransaction).toHaveBeenCalled();

    expect(DBContextMock.rollbackTransaction).toHaveBeenCalled();

    expect(DBContextMock.commitTransaction).not.toHaveBeenCalled();
  });
});
