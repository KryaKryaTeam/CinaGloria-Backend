import { CreateScoreCommand } from './CreateScore.command';
import { ApiErrorsCodeVal } from 'src/error/ApiError';

describe('CreateScoreCommand', () => {
  let command: CreateScoreCommand;

  const scoreRepository = {
    save: jest.fn(),
  };

  const taskRepository = {
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
    command = new CreateScoreCommand();

    (command as any).scoreRepository = scoreRepository;
    (command as any).taskRepository = taskRepository;

    (command as any).DBContext = DBContext;
    (command as any).eventDispatcher = eventDispatcher;

    jest.clearAllMocks();
  });

  const dto = {
    score: 95,
    task: 'task-id',
    team: 'team-id',
  };

  it('should create score and commit transaction', async () => {
    const task = {
      id: 'task-id',
    };

    taskRepository.findById.mockResolvedValue(task);

    await command.execute(dto as any);

    expect(DBContext.startTransaction).toHaveBeenCalledTimes(1);

    expect(taskRepository.findById).toHaveBeenCalledWith('task-id');

    expect(scoreRepository.save).toHaveBeenCalledTimes(1);

    const savedScore = scoreRepository.save.mock.calls[0][0];

    expect(savedScore.score).toBe(95);
    expect(savedScore.task).toBe(task);
    expect(savedScore.team).toBe('team-id');

    expect(DBContext.commitTransaction).toHaveBeenCalledTimes(1);

    expect(eventDispatcher.dispatchEvents).toHaveBeenCalledTimes(1);

    expect(DBContext.rollbackTransaction).not.toHaveBeenCalled();
  });

  it('should rollback if task not found', async () => {
    taskRepository.findById.mockResolvedValue(null);

    await expect(command.execute(dto as any)).rejects.toThrow();

    expect(taskRepository.findById).toHaveBeenCalledWith('task-id');

    expect(scoreRepository.save).not.toHaveBeenCalled();

    expect(DBContext.startTransaction).toHaveBeenCalledTimes(1);

    expect(DBContext.rollbackTransaction).toHaveBeenCalledTimes(1);

    expect(DBContext.commitTransaction).not.toHaveBeenCalled();

    expect(eventDispatcher.dispatchEvents).not.toHaveBeenCalled();
  });

  it('should throw TASK_NOT_FOUND error', async () => {
    taskRepository.findById.mockResolvedValue(null);

    try {
      await command.execute(dto as any);
    } catch (err: any) {
      expect(err.message).toContain(ApiErrorsCodeVal.TASK_004.message);
    }
  });
});
