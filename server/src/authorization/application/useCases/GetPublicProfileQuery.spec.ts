import { Test, TestingModule } from '@nestjs/testing';
import { GetPublicProfileQuery } from './GetPublicProfileQuery';
import { BaseTokens, ReposTokens } from 'src/common/Tokens';
import { DomainError } from 'src/error/DomainError';
import { createMockDBContext } from 'src/common/application/IDcontext.spec';
import { createMockEventDispatcher } from 'src/common/application/events/EventDispatcher';

describe('GetPublicProfileQuery', () => {
  let query: GetPublicProfileQuery;

  // 1. Створюємо мок репозиторію
  const mockUserRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPublicProfileQuery,
        {
          provide: ReposTokens.UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: BaseTokens.DBContext,
          useValue: createMockDBContext(),
        },
        {
          provide: BaseTokens.EventDispatcher,
          useValue: createMockEventDispatcher(),
        },
      ],
    }).compile();

    query = module.get<GetPublicProfileQuery>(GetPublicProfileQuery);
    jest.clearAllMocks();
  });

  it('should return public profile when user exists', async () => {
    const userId = 'user-uuid';
    const mockPublicProfile = {
      username: 'johndoe',
      avatarUrl: 'https://example.com/photo.jpg',
    };

    // 2. Налаштовуємо мок так, щоб він повертав об'єкт з властивістю publicProfile
    mockUserRepository.findById.mockResolvedValue({
      publicProfile: mockPublicProfile,
    });

    const result = await query.implementation(userId);

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(result).toEqual(mockPublicProfile);
  });

  it('should throw DomainError when user is not found', async () => {
    const userId = 'invalid-id';

    // 3. Репозиторій повертає null (користувача не знайдено)
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(query.implementation(userId)).rejects.toThrow(DomainError);
    await expect(query.implementation(userId)).rejects.toThrow();
  });
});
