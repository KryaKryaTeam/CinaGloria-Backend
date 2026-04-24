import { HandleCompetitionScheduledEventsCommand } from './HandleCompetitionScheduledEvents.command';

describe('HandleCompetitionScheduledEventsCommand', () => {
  let command: HandleCompetitionScheduledEventsCommand;

  const mockRepo = {
    findAllScheduledNotProcessed: jest.fn(),
    findAllRegistrationStartedNotProcessed: jest.fn(),
    findAllRegistrationEndedNotProcessed: jest.fn(),
    findAllStartedNotProcessed: jest.fn(),
    findAllEndedNotProcessed: jest.fn(),
    save: jest.fn(),
  };

  const createCompetitionMock = () => ({
    publish: jest.fn(),
    startRegistration: jest.fn(),
    endRegistration: jest.fn(),
    start: jest.fn(),
    end: jest.fn(),
    pullEvents: jest.fn(),
  });

  beforeEach(() => {
    command = new HandleCompetitionScheduledEventsCommand();
    (command as any).competitionRepository = mockRepo;
    (command as any).eventDispatcher = {}; // stub

    jest.clearAllMocks();
  });

  it('should process competitions and call actions + save', async () => {
    const comp = createCompetitionMock();

    mockRepo.findAllScheduledNotProcessed.mockResolvedValue([comp]);
    mockRepo.findAllRegistrationStartedNotProcessed.mockResolvedValue([]);
    mockRepo.findAllRegistrationEndedNotProcessed.mockResolvedValue([]);
    mockRepo.findAllStartedNotProcessed.mockResolvedValue([]);
    mockRepo.findAllEndedNotProcessed.mockResolvedValue([]);

    await command.execute();

    expect(comp.publish).toHaveBeenCalled();
    expect(comp.pullEvents).toHaveBeenCalled();
    expect(mockRepo.save).toHaveBeenCalledWith(comp);
  });

  it('should skip steps with no competitions', async () => {
    mockRepo.findAllScheduledNotProcessed.mockResolvedValue([]);
    mockRepo.findAllRegistrationStartedNotProcessed.mockResolvedValue([]);
    mockRepo.findAllRegistrationEndedNotProcessed.mockResolvedValue([]);
    mockRepo.findAllStartedNotProcessed.mockResolvedValue([]);
    mockRepo.findAllEndedNotProcessed.mockResolvedValue([]);

    await command.execute();

    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('should process multiple competitions in parallel', async () => {
    const comp1 = createCompetitionMock();
    const comp2 = createCompetitionMock();

    mockRepo.findAllScheduledNotProcessed.mockResolvedValue([comp1, comp2]);
    mockRepo.findAllRegistrationStartedNotProcessed.mockResolvedValue([]);
    mockRepo.findAllRegistrationEndedNotProcessed.mockResolvedValue([]);
    mockRepo.findAllStartedNotProcessed.mockResolvedValue([]);
    mockRepo.findAllEndedNotProcessed.mockResolvedValue([]);

    await command.execute();

    expect(comp1.publish).toHaveBeenCalled();
    expect(comp2.publish).toHaveBeenCalled();
    expect(mockRepo.save).toHaveBeenCalledTimes(2);
  });

  it('should call all fetch methods', async () => {
    mockRepo.findAllScheduledNotProcessed.mockResolvedValue([]);
    mockRepo.findAllRegistrationStartedNotProcessed.mockResolvedValue([]);
    mockRepo.findAllRegistrationEndedNotProcessed.mockResolvedValue([]);
    mockRepo.findAllStartedNotProcessed.mockResolvedValue([]);
    mockRepo.findAllEndedNotProcessed.mockResolvedValue([]);

    await command.execute();

    expect(mockRepo.findAllScheduledNotProcessed).toHaveBeenCalled();
    expect(mockRepo.findAllRegistrationStartedNotProcessed).toHaveBeenCalled();
    expect(mockRepo.findAllRegistrationEndedNotProcessed).toHaveBeenCalled();
    expect(mockRepo.findAllStartedNotProcessed).toHaveBeenCalled();
    expect(mockRepo.findAllEndedNotProcessed).toHaveBeenCalled();
  });
});
