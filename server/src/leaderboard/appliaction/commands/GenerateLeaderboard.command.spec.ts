import { Test, TestingModule } from '@nestjs/testing';

import { GenerateLeaderboardCommand } from './GenerateLeaderboard.command';

import { BaseTokens, ReposTokens } from 'src/common/Tokens';

import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';

import { Icons } from 'src/types/Icons';
import { RoundStatus } from 'src/types/RoundStatus';

describe('GenerateLeaderboardCommand', () => {
  let command: GenerateLeaderboardCommand;

  const DBContextMock = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
  };

  const eventDispatcherMock = {
    dispatchEvents: jest.fn(),
  };

  const submissionRepositoryMock = {
    findByRound: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateLeaderboardCommand,

        {
          provide: BaseTokens.DBContext,
          useValue: DBContextMock,
        },

        {
          provide: BaseTokens.EventDispatcher,
          useValue: eventDispatcherMock,
        },

        {
          provide: ReposTokens.SubmitionRepository,
          useValue: submissionRepositoryMock,
        },
      ],
    }).compile();

    command = module.get(GenerateLeaderboardCommand);
  });

  const round = RoundEntity.load({
    id: 'round-id',
    name: 'Final Round',
    description: 'desc',
    hidden: false,
    icon: Icons.BOOK,
    startOfRound: new Date(Date.now() - 100000),
    taskTimeout: new Date(Date.now() + 100000),
    endOfRound: new Date(Date.now() + 200000),
    relatedTasks: [],
    status: RoundStatus.ON_JUDGING,
    teams: [],
    leaderboard: undefined,
  });

  it('should generate leaderboard successfully', async () => {
    const submissions = [
      {
        id: 'submission-1',
        team: {
          id: 'team-1',
          name: 'Team 1',
        },
        review: {
          summary: 300,
          relatedScores: [],
        },
      },

      {
        id: 'submission-2',
        team: {
          id: 'team-2',
          name: 'Team 2',
        },
        review: {
          summary: 100,
          relatedScores: [],
        },
      },

      {
        id: 'submission-3',
        team: {
          id: 'team-3',
          name: 'Team 3',
        },
        review: {
          summary: 200,
          relatedScores: [],
        },
      },
    ];

    submissionRepositoryMock.findByRound.mockResolvedValue(submissions);

    const result = await command.execute(round);

    expect(DBContextMock.startTransaction).toHaveBeenCalled();

    expect(DBContextMock.commitTransaction).toHaveBeenCalled();

    expect(eventDispatcherMock.dispatchEvents).toHaveBeenCalled();

    expect(submissionRepositoryMock.findByRound).toHaveBeenCalledWith(round);

    expect(result.nodes).toHaveLength(3);

    // sorted ascending by summary
    expect(result.nodes[0].team.id).toBe('team-2');
    expect(result.nodes[0].place).toBe(1);

    expect(result.nodes[1].team.id).toBe('team-3');
    expect(result.nodes[1].place).toBe(2);

    expect(result.nodes[2].team.id).toBe('team-1');
    expect(result.nodes[2].place).toBe(3);
  });

  it('should rollback transaction if submission has no review', async () => {
    const submissions = [
      {
        id: 'submission-1',
        team: {
          id: 'team-1',
          name: 'Team 1',
        },
        review: undefined,
      },
    ];

    submissionRepositoryMock.findByRound.mockResolvedValue(submissions);

    await expect(command.execute(round)).rejects.toThrow();

    expect(DBContextMock.startTransaction).toHaveBeenCalled();

    expect(DBContextMock.rollbackTransaction).toHaveBeenCalled();

    expect(DBContextMock.commitTransaction).not.toHaveBeenCalled();
  });

  it('should generate empty leaderboard', async () => {
    submissionRepositoryMock.findByRound.mockResolvedValue([]);

    const result = await command.execute(round);

    expect(result.nodes).toHaveLength(0);

    expect(DBContextMock.commitTransaction).toHaveBeenCalled();
  });
});
