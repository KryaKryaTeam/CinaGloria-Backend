import { UpdateSubmissionCommand } from './UpdateSubmission.command';
import { ApiErrorsCodeVal } from 'src/error/ApiError';
import { SubmissionService } from 'src/judging/domain/services/SubmissionService';

jest.mock('src/judging/domain/services/SubmissionService', () => ({
  SubmissionService: {
    canSubmit: jest.fn(),
  },
}));

describe('UpdateSubmissionCommand', () => {
  let command: UpdateSubmissionCommand;

  const submissionRepository = {
    findById: jest.fn(),
    save: jest.fn(),
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
    command = new UpdateSubmissionCommand();

    (command as any).submissionRepository = submissionRepository;

    (command as any).DBContext = DBContext;
    (command as any).eventDispatcher = eventDispatcher;

    jest.clearAllMocks();
  });

  const dto = {
    id: 'sub-1',
    githubURL: 'new-github',
    youtubeURL: 'new-youtube',
  };

  it('should update submission and save', async () => {
    const entity = {
      id: 'sub-1',
      githubURL: 'old-github',
      youtubeURL: 'old-youtube',
    };

    submissionRepository.findById.mockResolvedValue(entity);

    (SubmissionService.canSubmit as jest.Mock).mockReturnValue(true);

    await command.execute(dto as any);

    expect(submissionRepository.findById).toHaveBeenCalledWith('sub-1');

    expect(SubmissionService.canSubmit).toHaveBeenCalledWith(entity);

    expect(entity.githubURL).toBe('new-github');
    expect(entity.youtubeURL).toBe('new-youtube');

    expect(submissionRepository.save).toHaveBeenCalledWith(entity);

    expect(DBContext.commitTransaction).toHaveBeenCalledTimes(1);
    expect(eventDispatcher.dispatchEvents).toHaveBeenCalledTimes(1);
  });

  it('should keep old values if dto fields are missing', async () => {
    const entity = {
      id: 'sub-1',
      githubURL: 'old-github',
      youtubeURL: 'old-youtube',
    };

    submissionRepository.findById.mockResolvedValue(entity);

    (SubmissionService.canSubmit as jest.Mock).mockReturnValue(true);

    await command.execute({
      id: 'sub-1',
    } as any);

    expect(entity.githubURL).toBe('old-github');
    expect(entity.youtubeURL).toBe('old-youtube');

    expect(submissionRepository.save).toHaveBeenCalledWith(entity);
  });

  it('should throw SUBMITION_NOT_FOUND if entity missing', async () => {
    submissionRepository.findById.mockResolvedValue(null);

    await expect(command.execute(dto as any)).rejects.toThrow();

    expect(submissionRepository.save).not.toHaveBeenCalled();
  });

  it('should throw CANNOT_SUBMIT if service blocks it', async () => {
    const entity = {
      id: 'sub-1',
    };

    submissionRepository.findById.mockResolvedValue(entity);

    (SubmissionService.canSubmit as jest.Mock).mockReturnValue(false);

    await expect(command.execute(dto as any)).rejects.toThrow();

    expect(submissionRepository.save).not.toHaveBeenCalled();
  });

  it('should throw correct SUBMITION_NOT_FOUND error', async () => {
    submissionRepository.findById.mockResolvedValue(null);

    try {
      await command.execute(dto as any);
    } catch (err: any) {
      expect(err.message).toContain(ApiErrorsCodeVal.SUBMITION_001.message);
    }
  });
});
