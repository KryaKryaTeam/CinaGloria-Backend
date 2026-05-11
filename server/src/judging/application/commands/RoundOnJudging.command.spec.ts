import { RoundOnJudgingCommand } from './RoundOnJudging.command';
import { RoundStatus } from 'src/types/RoundStatus';
import { SendNotificationEvent } from 'src/notification/domain/events/SendNotificationEvent';

describe('RoundOnJudgingCommand', () => {
  let command: RoundOnJudgingCommand;

  const roundRepository = {
    findAllTimedOut: jest.fn(),
    save: jest.fn(),
  };

  const userRepository = {
    findAllJuries: jest.fn(),
  };

  const submissionRepository = {
    findByRound: jest.fn(),
    save: jest.fn(),
  };

  const DBContext = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
  };

  const eventDispatcher = {
    addEvent: jest.fn(),
    dispatchEvents: jest.fn(),
  };

  beforeEach(() => {
    command = new RoundOnJudgingCommand();

    (command as any).roundRepository = roundRepository;
    (command as any).userRepository = userRepository;
    (command as any).submissionRepository = submissionRepository;

    (command as any).DBContext = DBContext;
    (command as any).eventDispatcher = eventDispatcher;

    jest.clearAllMocks();
  });

  it('should assign submissions to juries, update rounds and emit notifications', async () => {
    const round = {
      id: 'round-1',
      name: 'Final Round',
      status: RoundStatus.CREATED,
    };

    const juries = [{ id: 'jury-1' }, { id: 'jury-2' }];

    const submissions = [
      {
        id: 'sub-1',
        assignedToJury: null,
      },
      {
        id: 'sub-2',
        assignedToJury: null,
      },
    ];

    roundRepository.findAllTimedOut.mockResolvedValue([round]);
    userRepository.findAllJuries.mockResolvedValue(juries);
    submissionRepository.findByRound.mockResolvedValue(submissions);

    await command.execute(undefined as any);

    expect(roundRepository.findAllTimedOut).toHaveBeenCalledTimes(1);
    expect(userRepository.findAllJuries).toHaveBeenCalledTimes(1);

    // round updated
    expect(round.status).toBe(RoundStatus.ON_JUDGING);
    expect(roundRepository.save).toHaveBeenCalledWith(round);

    // submissions assigned + saved
    expect(submissionRepository.save).toHaveBeenCalledTimes(2);

    expect(submissions[0].assignedToJury).toBe('jury-1');
    expect(submissions[1].assignedToJury).toBe('jury-2');

    // notifications emitted
    expect(eventDispatcher.addEvent).toHaveBeenCalledTimes(2);

    const event = eventDispatcher.addEvent.mock.calls[0][0];

    expect(event).toBeInstanceOf(SendNotificationEvent);
  });

  it('should handle empty rounds safely', async () => {
    roundRepository.findAllTimedOut.mockResolvedValue([]);
    userRepository.findAllJuries.mockResolvedValue([]);

    await command.execute(undefined as any);

    expect(roundRepository.save).not.toHaveBeenCalled();
    expect(submissionRepository.save).not.toHaveBeenCalled();
    expect(eventDispatcher.addEvent).not.toHaveBeenCalled();
  });
});
