import { Test, TestingModule } from '@nestjs/testing';

import { BaseTokens, ReposTokens } from 'src/common/Tokens';

import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';
import { TaskEntity } from 'src/competitions/domain/entities/Task.entity';

import { ScoreEntity } from 'src/judging/domain/entities/Score.entity';

import { RoundStatus } from 'src/types/RoundStatus';
import { Icons } from 'src/types/Icons';
import { CreateRoundReviewCommand } from './CreateRoundReview.command';

describe('CreateRoundReviewCommand', () => {
  let command: CreateRoundReviewCommand;

  const DBContextMock = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
  };

  const eventDispatcherMock = {
    dispatchEvents: jest.fn(),
  };

  const roundReviewRepositoryMock = {
    save: jest.fn(),
  };

  const scoreRepositoryMock = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  const roundRepositoryMock = {
    findById: jest.fn(),
  };

  const submissionRepositoryMock = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateRoundReviewCommand,

        {
          provide: BaseTokens.DBContext,
          useValue: DBContextMock,
        },
        {
          provide: BaseTokens.EventDispatcher,
          useValue: eventDispatcherMock,
        },

        {
          provide: ReposTokens.RoundReviewRepository,
          useValue: roundReviewRepositoryMock,
        },
        {
          provide: ReposTokens.ScoreRepository,
          useValue: scoreRepositoryMock,
        },
        {
          provide: ReposTokens.RoundRepository,
          useValue: roundRepositoryMock,
        },
        {
          provide: ReposTokens.SubmitionRepository,
          useValue: submissionRepositoryMock,
        },
      ],
    }).compile();

    command = module.get(CreateRoundReviewCommand);
  });

  const task1 = TaskEntity.createFake();
  const task2 = TaskEntity.createFake();

  const round = RoundEntity.load({
    id: 'round-id',
    name: 'Round',
    description: 'desc',
    hidden: false,
    icon: Icons.BOOK,
    startOfRound: new Date(Date.now() - 100000),
    taskTimeout: new Date(Date.now() + 100000),
    endOfRound: new Date(Date.now() + 200000),
    relatedTasks: [task1, task2],
    status: RoundStatus.ON_JUDGING,
    teams: [],
  });

  const submission = {
    id: 'submission-id',
    team: {
      id: 'team-id',
    },
  };

  it('should create review successfully', async () => {
    const score1 = ScoreEntity.create({
      score: 100,
      task: task1,
      team: 'team-id',
    });

    const score2 = ScoreEntity.create({
      score: 50,
      task: task2,
      team: 'team-id',
    });

    scoreRepositoryMock.findById
      .mockResolvedValueOnce(score1)
      .mockResolvedValueOnce(score2);

    roundRepositoryMock.findById.mockResolvedValue(round);

    submissionRepositoryMock.findById.mockResolvedValue(submission);

    await command.execute({
      summary: 10,
      description: 'dasd',
      byJury: 'a4c50a63-9d66-4aba-b125-608ed205cb4f',
      round: 'ff1c02c7-efb1-4162-b463-a76bf04dccba',
      relatedScores: ['score-1', 'score-2'],
      submission: '12701555-3b0a-4dbe-a918-0ebb9b7c7473',
    });

    expect(DBContextMock.startTransaction).toHaveBeenCalled();
    expect(DBContextMock.commitTransaction).toHaveBeenCalled();

    expect(eventDispatcherMock.dispatchEvents).toHaveBeenCalled();

    expect(roundReviewRepositoryMock.save).toHaveBeenCalled();

    // no zero scores needed now
    expect(scoreRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('should rollback transaction if duplicated task scores provided', async () => {
    const score1 = ScoreEntity.create({
      score: 100,
      task: task1,
      team: 'team-id',
    });

    const duplicatedScore = ScoreEntity.create({
      score: 50,
      task: task1,
      team: 'team-id',
    });

    scoreRepositoryMock.findById
      .mockResolvedValueOnce(score1)
      .mockResolvedValueOnce(duplicatedScore);

    roundRepositoryMock.findById.mockResolvedValue(round);

    submissionRepositoryMock.findById.mockResolvedValue(submission);

    await expect(
      command.execute({
        summary: 123123,
        round: 'round-id',
        submission: 'submission-id',
        description: 'good',
        byJury: 'jury-id',
        relatedScores: [score1.id, duplicatedScore.id],
      }),
    ).rejects.toThrow();

    expect(DBContextMock.startTransaction).toHaveBeenCalled();

    expect(DBContextMock.rollbackTransaction).toHaveBeenCalled();

    expect(DBContextMock.commitTransaction).not.toHaveBeenCalled();

    expect(roundReviewRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('should create zero score for missing tasks', async () => {
    const score1 = ScoreEntity.create({
      score: 100,
      task: task1,
      team: 'team-id',
    });

    roundRepositoryMock.findById.mockResolvedValue(round);

    submissionRepositoryMock.findById.mockResolvedValue(submission);

    scoreRepositoryMock.findById.mockResolvedValue(score1);

    scoreRepositoryMock.save.mockImplementation(async (score) => score);

    await command.execute({
      summary: 21123,
      round: 'round-id',
      submission: 'submission-id',
      description: 'review',
      byJury: 'jury-id',
      relatedScores: [score1.id],
    });

    expect(scoreRepositoryMock.save).toHaveBeenCalledTimes(1);

    const createdZeroScore = scoreRepositoryMock.save.mock.calls[0][0];

    expect(createdZeroScore.score).toBe(0);

    expect(createdZeroScore.task.id).toBe(task2.id);
  });
});
