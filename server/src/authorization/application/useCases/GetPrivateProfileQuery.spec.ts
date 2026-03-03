import { Test, TestingModule } from '@nestjs/testing';
import { GetPrivateProfileQuery } from './GetPrivateProfileQuery';
import { BaseTokens, ReposTokens } from 'src/common/Tokens';
import { DomainError } from 'src/error/DomainError';
import { createMockDBContext } from 'src/common/application/IDcontext.spec';
import { createMockEventDispatcher } from 'src/common/application/events/EventDispatcher';

describe('GetPrivateProfileQuery', () => {
  let query: GetPrivateProfileQuery;

  // Створюємо мок репозиторію
  const mockUserRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPrivateProfileQuery,
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

    // Отримуємо екземпляр запиту через DI (щоб Inject спрацював)
    query = module.get<GetPrivateProfileQuery>(GetPrivateProfileQuery);
    jest.clearAllMocks();
  });

  it('should return private profile if user exists', async () => {
    const userId = 'user-123';
    const mockProfile = { email: 'test@example.com', username: 'tester' };

    // Симулюємо поведінку сутності UserEntity
    mockUserRepository.findById.mockResolvedValue({
      privateProfile: mockProfile,
    });

    const result = await query.implementation(userId);

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(result).toEqual(mockProfile);
  });

  it('should throw DomainError if user is not found', async () => {
    const userId = 'non-existent';

    // Репозиторій повертає null
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(query.implementation(userId)).rejects.toThrow(DomainError);
    await expect(query.implementation(userId)).rejects.toThrow();
  });
});
