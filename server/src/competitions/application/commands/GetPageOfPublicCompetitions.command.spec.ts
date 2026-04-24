import { GetPublicCompetitionsPageQuery } from './GetPageOfPublicCompetitions.command';

describe('GetPublicCompetitionsPageQuery', () => {
  let query: GetPublicCompetitionsPageQuery;

  const mockRepo = {
    getPage: jest.fn(),
  };

  beforeEach(() => {
    query = new GetPublicCompetitionsPageQuery();
    (query as any).competitionRepository = mockRepo;

    jest.clearAllMocks();
  });

  it('should return only public competitions', async () => {
    const repoResult = [
      { id: '1', publicInList: { id: 'pub-1' } },
      { id: '2', publicInList: null },
      { id: '3', publicInList: { id: 'pub-3' } },
    ];

    mockRepo.getPage.mockResolvedValue(repoResult);

    const result = await query.execute({ page: 1 });

    expect(mockRepo.getPage).toHaveBeenCalledWith(1);
    expect(result).toEqual({
      competitions: [{ id: 'pub-1' }, { id: 'pub-3' }],
    });
  });

  it('should throw if repo returns empty array', async () => {
    mockRepo.getPage.mockResolvedValue([]);

    await expect(query.execute({ page: 1 })).rejects.toThrow();

    expect(mockRepo.getPage).toHaveBeenCalledWith(1);
  });

  it('should throw if no public competitions after filtering', async () => {
    const repoResult = [
      { id: '1', publicInList: null },
      { id: '2', publicInList: undefined },
    ];

    mockRepo.getPage.mockResolvedValue(repoResult);

    await expect(query.execute({ page: 1 })).rejects.toThrow();

    expect(mockRepo.getPage).toHaveBeenCalledWith(1);
  });
});
