import { DeleteSubmissionCommand } from './DeleteSubmission.command';

describe('DeleteSubmissionCommand', () => {
  let command: DeleteSubmissionCommand;

  const submissionRepository = {
    delete: jest.fn(),
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
    command = new DeleteSubmissionCommand();

    (command as any).submissionRepository = submissionRepository;

    (command as any).DBContext = DBContext;
    (command as any).eventDispatcher = eventDispatcher;

    jest.clearAllMocks();
  });

  it('should delete submission and commit transaction', async () => {
    const id = 'submission-id';

    await command.execute(id);

    expect(DBContext.startTransaction).toHaveBeenCalledTimes(1);

    expect(submissionRepository.delete).toHaveBeenCalledTimes(1);
    expect(submissionRepository.delete).toHaveBeenCalledWith(id);

    expect(DBContext.commitTransaction).toHaveBeenCalledTimes(1);

    expect(eventDispatcher.dispatchEvents).toHaveBeenCalledTimes(1);

    expect(DBContext.rollbackTransaction).not.toHaveBeenCalled();
  });

  it('should rollback if repository throws', async () => {
    const id = 'submission-id';

    submissionRepository.delete.mockRejectedValueOnce(
      new Error('delete failed'),
    );

    await expect(command.execute(id)).rejects.toThrow('delete failed');

    expect(DBContext.startTransaction).toHaveBeenCalledTimes(1);

    expect(submissionRepository.delete).toHaveBeenCalledWith(id);

    expect(DBContext.rollbackTransaction).toHaveBeenCalledTimes(1);

    expect(DBContext.commitTransaction).not.toHaveBeenCalled();

    expect(eventDispatcher.dispatchEvents).not.toHaveBeenCalled();
  });
});
