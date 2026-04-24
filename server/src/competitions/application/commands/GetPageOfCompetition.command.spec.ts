import { GetCompetitionPageQuery } from './GetPageOfCompetition.command';
import { UserAndCompetitionService } from 'src/competitions/domain/services/UserAndCompetitionService';

describe('GetCompetitionPageQuery', () => {
  let query: GetCompetitionPageQuery;

  const mockRepo = {
    getPage: jest.fn(),
  };

  const user = { id: 'user-1' } as any;
  const competitions = [{ id: 'comp-1' }, { id: 'comp-2' }] as any;

  beforeEach(() => {
    query = new GetCompetitionPageQuery();
    (query as any).competitionRepository = mockRepo;

    jest.clearAllMocks();
  });

  it('should return competitions page', async () => {
    mockRepo.getPage.mockResolvedValue(competitions);

    const accessSpy = jest.spyOn(
      UserAndCompetitionService,
      'userHasAccessToSeePrivateCompetitions',
    );

    const result = await query.execute({
      page: 1,
      user,
    });

    expect(accessSpy).toHaveBeenCalledWith(user);
    expect(mockRepo.getPage).toHaveBeenCalledWith(1);
    expect(result).toEqual({ competitions });
  });

  it('should throw if page is empty', async () => {
    mockRepo.getPage.mockResolvedValue([]);

    await expect(
      query.execute({
        page: 1,
        user,
      }),
    ).rejects.toThrow();

    expect(mockRepo.getPage).toHaveBeenCalledWith(1);
  });

  it('should call access check before fetching', async () => {
    mockRepo.getPage.mockResolvedValue(competitions);

    const order: string[] = [];

    jest
      .spyOn(UserAndCompetitionService, 'userHasAccessToSeePrivateCompetitions')
      .mockImplementation(() => {
        order.push('access');
        return true;
      });

    mockRepo.getPage.mockImplementation(async () => {
      order.push('repo');
      return competitions;
    });

    await query.execute({
      page: 1,
      user,
    });

    expect(order).toEqual(['access', 'repo']);
  });
});
