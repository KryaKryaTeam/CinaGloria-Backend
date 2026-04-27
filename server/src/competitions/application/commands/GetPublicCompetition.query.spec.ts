import { GetPublicCompetitionQuery } from './GetPublicCompetition.query';

describe('GetPublicCompetitionQuery', () => {
  let query: GetPublicCompetitionQuery;

  const mockRepo = {
    findById: jest.fn(),
  };

  const mockEventDispatcher = {
    dispatchEvents: jest.fn(),
  };

  const mockDbContext = {};

  beforeEach(() => {
    query = new GetPublicCompetitionQuery();

    (query as any).competitionRepository = mockRepo;
    (query as any).eventDispatcher = mockEventDispatcher;
    (query as any).DBContext = mockDbContext;

    jest.clearAllMocks();
  });

  it('should return public competition', async () => {
    const repoResult = {
      id: 'comp-1',
      publicOnPage: { id: 'public-comp-1' },
    };

    mockRepo.findById.mockResolvedValue(repoResult);

    const result = await query.execute({
      competitionId: 'comp-1',
    });

    expect(mockRepo.findById).toHaveBeenCalledWith('comp-1');

    expect(result).toEqual({
      competition: { id: 'public-comp-1' },
    });
  });

  it('should throw if competition not found', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(query.execute({ competitionId: 'comp-1' })).rejects.toThrow();

    expect(mockRepo.findById).toHaveBeenCalledWith('comp-1');
    expect(mockEventDispatcher.dispatchEvents).not.toHaveBeenCalled();
  });

  it('should throw if competition is not public', async () => {
    const repoResult = {
      id: 'comp-1',
      publicOnPage: null,
    };

    mockRepo.findById.mockResolvedValue(repoResult);

    await expect(query.execute({ competitionId: 'comp-1' })).rejects.toThrow();

    expect(mockRepo.findById).toHaveBeenCalledWith('comp-1');
    expect(mockEventDispatcher.dispatchEvents).not.toHaveBeenCalled();
  });
});
