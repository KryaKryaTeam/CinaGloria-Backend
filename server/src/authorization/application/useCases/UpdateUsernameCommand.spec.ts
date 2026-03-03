import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUsernameCommand } from './UpdateUsernameCommand';
import { BaseTokens, ReposTokens } from 'src/common/Tokens';
import { DomainError, DomainErrors } from 'src/error/DomainError';
import { createMockDBContext } from 'src/common/application/IDcontext.spec';
import { createMockEventDispatcher } from 'src/common/application/events/EventDispatcher';

describe('UpdateUsernameCommand', () => {
  let command: UpdateUsernameCommand;

  // Мок репозиторію
  const mockUserRepository = {
    findById: jest.fn(),
    existsByUsername: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUsernameCommand,
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

    command = module.get<UpdateUsernameCommand>(UpdateUsernameCommand);
    jest.clearAllMocks();
  });

  it('should change username and save user when username is unique', async () => {
    const userId = 'user-123';
    const newUsername = 'new-cool-username';

    // Створюємо мок сутності, що імітує поведінку методу changeUsername
    const mockUserEntity = {
      id: userId,
      // Ми імітуємо виклик колбека всередині методу
      changeUsername: jest
        .fn()
        .mockImplementation(
          async (
            username: string,
            checkFn: (arg: string) => Promise<boolean>,
          ) => {
            const isUnique = await checkFn(username);
            if (!isUnique) throw new Error('Not unique');
          },
        ),
    };

    mockUserRepository.findById.mockResolvedValue(mockUserEntity);
    mockUserRepository.existsByUsername.mockResolvedValue(false); // Ніхто не зайняв ім'я

    await command.implementation({ id: userId, username: newUsername });

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockUserEntity.changeUsername).toHaveBeenCalled();
    expect(mockUserRepository.save).toHaveBeenCalledWith(mockUserEntity);
  });

  it('should propagate error if username already exists', async () => {
    const userId = 'user-123';
    const takenUsername = 'already-taken';

    const mockUserEntity = {
      id: userId,
      changeUsername: jest
        .fn()
        .mockImplementation(
          async (
            username: string,
            checkFn: (arg: string) => Promise<boolean>,
          ) => {
            const isUnique = await checkFn(username);
            if (!isUnique)
              throw new DomainError(DomainErrors.RESTRICTED_CHANGE);
          },
        ),
    };

    mockUserRepository.findById.mockResolvedValue(mockUserEntity);
    mockUserRepository.existsByUsername.mockResolvedValue(true); // Ім'я вже зайняте

    await expect(
      command.implementation({ id: userId, username: takenUsername }),
    ).rejects.toThrow();

    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  it('should throw DomainError if user not found', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(
      command.implementation({ id: 'none', username: 'valid' }),
    ).rejects.toThrow();
  });
});
