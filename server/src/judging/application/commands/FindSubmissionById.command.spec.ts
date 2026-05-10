import { FindSubmissionByIdCommand } from './FindSubmissionById.command';
import { ApiErrorsCodeVal } from 'src/error/ApiError';

describe('FindSubmissionByIdCommand', () => {
  let command: FindSubmissionByIdCommand;

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
    command = new FindSubmissionByIdCommand();

    (command as any).submissionRepository = submissionRepository;

    (command as any).DBContext = DBContext;
    (command as any).eventDispatcher = eventDispatcher;

    jest.clearAllMocks();
  });

  it('should return submission when found', async () => {
    const submission = {
      id: 'sub-1',
      githubURL: 'url',
    } as any;

    submissionRepository.findById.mockResolvedValue(submission);

    const result = await command.execute('sub-1');

    expect(DBContext.startTransaction).toHaveBeenCalledTimes(1);

    expect(submissionRepository.findById).toHaveBeenCalledWith('sub-1');

    expect(result).toBe(submission);

    expect(DBContext.commitTransaction).toHaveBeenCalledTimes(1);

    expect(eventDispatcher.dispatchEvents).toHaveBeenCalledTimes(1);

    expect(DBContext.rollbackTransaction).not.toHaveBeenCalled();
  });

  it('should rollback and throw if submission not found', async () => {
    submissionRepository.findById.mockResolvedValue(null);

    await expect(command.execute('sub-1')).rejects.toThrow();

    expect(DBContext.startTransaction).toHaveBeenCalledTimes(1);

    expect(submissionRepository.findById).toHaveBeenCalledWith('sub-1');

    expect(DBContext.rollbackTransaction).toHaveBeenCalledTimes(1);

    expect(DBContext.commitTransaction).not.toHaveBeenCalled();

    expect(eventDispatcher.dispatchEvents).not.toHaveBeenCalled();
  });

  it('should throw SUBMITION_NOT_FOUND error', async () => {
    submissionRepository.findById.mockResolvedValue(null);

    try {
      await command.execute('sub-1');
    } catch (err: any) {
      expect(err.message).toContain(ApiErrorsCodeVal.SUBMITION_001.message);
    }
  });
});
