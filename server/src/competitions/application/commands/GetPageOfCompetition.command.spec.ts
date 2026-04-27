import { Username } from 'src/authorization/domain/objects/Username.object';
import { GetCompetitionPageQuery } from './GetPageOfCompetition.command';
import { UserAndCompetitionService } from 'src/competitions/domain/services/UserAndCompetitionService';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { RelationSlots } from 'src/types/RelationSlots';
import { RoleEnum } from 'src/types/RoleEnum';

describe('GetCompetitionPageQuery', () => {
  let query: GetCompetitionPageQuery;

  const mockRepo = {
    getPage: jest.fn(),
  };

  const mockEventDispatcher = {
    dispatchEvents: jest.fn(),
  };

  const user = UserEntity.create(
    'test@mail.com',
    Username.create('valid_user_123'),
    InternalFile.define<typeof RelationSlots.user.avatar>(
      'avatar.png',
      'user:avatar',
      'user:avatar',
    ),
  );
  user.__forceSetRole(RoleEnum.ADMIN);

  const competitions = [{ id: 'comp-1' }, { id: 'comp-2' }] as any;

  beforeEach(() => {
    query = new GetCompetitionPageQuery();

    (query as any).competitionRepository = mockRepo;
    (query as any).eventDispatcher = mockEventDispatcher;

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

    expect(mockEventDispatcher.dispatchEvents).toHaveBeenCalled();
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
    expect(mockEventDispatcher.dispatchEvents).not.toHaveBeenCalled();
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
    expect(mockEventDispatcher.dispatchEvents).toHaveBeenCalled();
  });
});
