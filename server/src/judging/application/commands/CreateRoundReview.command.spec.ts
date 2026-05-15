import { CreateRoundReviewCommand } from './CreateRoundReview.command';
import { RoundStatus } from 'src/types/RoundStatus';

describe('CreateRoundReviewCommand', () => {
  let command: CreateRoundReviewCommand;

  const roundReviewRepository = {
    save: jest.fn(),
  };

  const scoreRepository = {
    findById: jest.fn(),
  };

  const roundRepository = {
    findById: jest.fn(),
  };

  const submissionRepository = {
    findById: jest.fn(),
  };

  const DBContext = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
  };

  const eventDispatcher = {
    dispatchEvents: jest.fn(),
  };

  beforeEach(() => {
    command = new CreateRoundReviewCommand();

    (command as any).roundReviewRepository = roundReviewRepository;
    (command as any).scoreRepository = scoreRepository;
    (command as any).roundRepository = roundRepository;
    (command as any).submissionRepository = submissionRepository;

    (command as any).DBContext = DBContext;
    (command as any).eventDispatcher = eventDispatcher;

    jest.clearAllMocks();
  });

  const dto = {
    summary: 0,
    description: 'Great work',
    byJury: 'jury-id',
    round: 'round-id',
    relatedScores: ['score-1', 'score-2'],
    submission: 'submission-id',
  };

  it('should create review and commit transaction', async () => {
    const round = {
      id: 'round-id',
      status: RoundStatus.ON_JUDGING,
    };

    const score1 = {
      id: 'score-1',
      score: 10,
    };

    const score2 = {
      id: 'score-2',
      score: 20,
    };

    const submission = {
      id: 'submission-id',
    };

    roundRepository.findById.mockResolvedValue(round);

    scoreRepository.findById
      .mockResolvedValueOnce(score1)
      .mockResolvedValueOnce(score2);

    submissionRepository.findById.mockResolvedValue(submission);

    await command.execute(dto as any);

    expect(DBContext.startTransaction).toHaveBeenCalledTimes(1);

    expect(roundRepository.findById).toHaveBeenCalledWith('round-id');

    expect(scoreRepository.findById).toHaveBeenNthCalledWith(1, 'score-1');

    expect(scoreRepository.findById).toHaveBeenNthCalledWith(2, 'score-2');

    expect(submissionRepository.findById).toHaveBeenCalledWith('submission-id');

    expect(roundReviewRepository.save).toHaveBeenCalledTimes(1);

    expect(DBContext.commitTransaction).toHaveBeenCalledTimes(1);

    expect(eventDispatcher.dispatchEvents).toHaveBeenCalledTimes(1);

    expect(DBContext.rollbackTransaction).not.toHaveBeenCalled();

    const savedReview = roundReviewRepository.save.mock.calls[0][0];

    expect(savedReview.description).toBe('Great work');
    expect(savedReview.byJury).toBe('jury-id');
    expect(savedReview.summary).toBe(30);
  });

  it('should rollback if round not found', async () => {
    roundRepository.findById.mockResolvedValue(null);

    await expect(command.execute(dto as any)).rejects.toThrow();

    expect(DBContext.startTransaction).toHaveBeenCalled();
    expect(DBContext.rollbackTransaction).toHaveBeenCalledTimes(1);

    expect(DBContext.commitTransaction).not.toHaveBeenCalled();

    expect(eventDispatcher.dispatchEvents).not.toHaveBeenCalled();

    expect(roundReviewRepository.save).not.toHaveBeenCalled();
  });

  it('should rollback if round is not on judging', async () => {
    roundRepository.findById.mockResolvedValue({
      id: 'round-id',
      status: RoundStatus.CREATED,
    });

    await expect(command.execute(dto as any)).rejects.toThrow();

    expect(DBContext.rollbackTransaction).toHaveBeenCalledTimes(1);

    expect(DBContext.commitTransaction).not.toHaveBeenCalled();

    expect(eventDispatcher.dispatchEvents).not.toHaveBeenCalled();

    expect(roundReviewRepository.save).not.toHaveBeenCalled();
  });

  it('should rollback if related score not found', async () => {
    roundRepository.findById.mockResolvedValue({
      id: 'round-id',
      status: RoundStatus.ON_JUDGING,
    });

    scoreRepository.findById.mockResolvedValue(null);

    await expect(command.execute(dto as any)).rejects.toThrow();

    expect(DBContext.rollbackTransaction).toHaveBeenCalledTimes(1);

    expect(DBContext.commitTransaction).not.toHaveBeenCalled();

    expect(eventDispatcher.dispatchEvents).not.toHaveBeenCalled();

    expect(roundReviewRepository.save).not.toHaveBeenCalled();
  });

  it('should rollback if submission not found', async () => {
    roundRepository.findById.mockResolvedValue({
      id: 'round-id',
      status: RoundStatus.ON_JUDGING,
    });

    scoreRepository.findById
      .mockResolvedValueOnce({
        id: 'score-1',
        score: 10,
      })
      .mockResolvedValueOnce({
        id: 'score-2',
        score: 20,
      });

    submissionRepository.findById.mockResolvedValue(null);

    await expect(command.execute(dto as any)).rejects.toThrow();

    expect(DBContext.rollbackTransaction).toHaveBeenCalledTimes(1);

    expect(DBContext.commitTransaction).not.toHaveBeenCalled();

    expect(eventDispatcher.dispatchEvents).not.toHaveBeenCalled();

    expect(roundReviewRepository.save).not.toHaveBeenCalled();
  });
});
