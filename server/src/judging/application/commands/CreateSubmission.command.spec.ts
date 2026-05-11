import { RoundStatus } from 'src/types/RoundStatus';
import { CreateSubmissionCommand } from './CreateSubmission.command';
import { ApiErrorsCodeVal } from 'src/error/ApiError';

describe('CreateSubmissionCommand', () => {
  let command: CreateSubmissionCommand;

  const submissionRepository = {
    save: jest.fn(),
  };

  const roundRepository = {
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
    command = new CreateSubmissionCommand();

    (command as any).submissionRepository = submissionRepository;
    (command as any).roundRepository = roundRepository;
    (command as any).DBContext = DBContext;
    (command as any).eventDispatcher = eventDispatcher;

    jest.clearAllMocks();
  });

  const dto = {
    githubURL: 'url',
    youtubeURL: 'url',
    relatedRound: { id: 'df7e385a-9f18-4076-95a7-cee5341b5bb4' } as any,
  } as any;

  it('should create submission and commit transaction', async () => {
    const round = {
      id: 'round-id',
      name: 'Final round',
      status: RoundStatus.CREATED,
    };

    roundRepository.findById.mockResolvedValue(round);

    await command.execute(dto);

    expect(DBContext.startTransaction).toHaveBeenCalledTimes(1);
    expect(roundRepository.findById).toHaveBeenCalledWith(dto.relatedRound);
    expect(submissionRepository.save).toHaveBeenCalledTimes(1);

    const savedSubmission = submissionRepository.save.mock.calls[0][0];

    expect(savedSubmission.githubURL).toEqual(dto.githubURL);
    expect(savedSubmission.youtubeURL).toEqual(dto.youtubeURL);
    expect(savedSubmission.assignedToJury).toBeUndefined();
    expect(savedSubmission.review).toBeUndefined();
    expect(DBContext.commitTransaction).toHaveBeenCalledTimes(1);
    expect(eventDispatcher.dispatchEvents).toHaveBeenCalledTimes(1);
    expect(DBContext.rollbackTransaction).not.toHaveBeenCalled();
  });

  it('should rollback if round not found', async () => {
    roundRepository.findById.mockResolvedValue(null);

    await expect(command.execute(dto)).rejects.toThrow();
    expect(roundRepository.findById).toHaveBeenCalledWith(dto.relatedRound);
    expect(submissionRepository.save).not.toHaveBeenCalled();
    expect(DBContext.startTransaction).toHaveBeenCalledTimes(1);
    expect(DBContext.rollbackTransaction).toHaveBeenCalledTimes(1);
    expect(DBContext.commitTransaction).not.toHaveBeenCalled();
    expect(eventDispatcher.dispatchEvents).not.toHaveBeenCalled();
  });

  it('should throw ROUND_NOT_FOUND error', async () => {
    roundRepository.findById.mockResolvedValue(null);

    try {
      await command.execute(dto);
    } catch (err: any) {
      expect(err.message).toContain(ApiErrorsCodeVal.ROUND_008.message);
    }
  });
});
